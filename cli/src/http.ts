import { readSession } from "./session.js";

export type HttpOptions = {
  apiBaseUrl?: string;
  cookie?: string;
};

export type ApiError = Error & {
  status?: number;
  details?: unknown;
};

function joinUrl(base: string, pathname: string): string {
  const b = base.replace(/\/+$/, "");
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${b}${p}`;
}

function toApiError(
  message: string,
  status?: number,
  details?: unknown,
): ApiError {
  const err = new Error(message) as ApiError;
  err.status = status;
  err.details = details;
  return err;
}

function extractCookiePairs(setCookieValue: string): string | null {
  const first = setCookieValue.split(";")[0]?.trim();
  if (!first) return null;
  if (!first.includes("=")) return null;
  return first;
}

export function cookieHeaderFromSetCookie(setCookies: string[]): string | null {
  const pairs = setCookies
    .map(extractCookiePairs)
    .filter((v): v is string => Boolean(v));
  if (!pairs.length) return null;
  return pairs.join("; ");
}

async function resolveHttpOptions(
  opts?: HttpOptions,
): Promise<Required<HttpOptions>> {
  const session = await readSession();
  const apiBaseUrl =
    (opts?.apiBaseUrl ?? session.apiBaseUrl ?? "http://localhost:4000/api/v1")
      .replace(/\/+$/, "");
  const cookie = opts?.cookie ?? session.cookie ?? "";
  return { apiBaseUrl, cookie };
}

export async function apiRequest<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  pathname: string,
  init?: {
    apiBaseUrl?: string;
    cookie?: string;
    json?: unknown;
    headers?: Record<string, string>;
  },
): Promise<{ data: T; response: Response }> {
  const { apiBaseUrl, cookie } = await resolveHttpOptions({
    apiBaseUrl: init?.apiBaseUrl,
    cookie: init?.cookie,
  });

  const headers: Record<string, string> = {
    ...(init?.headers ?? {}),
  };

  if (cookie) headers.Cookie = cookie;

  let body: string | undefined;
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  const res = await fetch(joinUrl(apiBaseUrl, pathname), {
    method,
    headers,
    body,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const details = isJson ? await res.json().catch(() => undefined) : undefined;
    const message =
      typeof (details as any)?.message === "string"
        ? (details as any).message
        : `Request failed (${res.status})`;
    throw toApiError(message, res.status, details);
  }

  const data = (isJson ? await res.json() : await res.text()) as T;
  return { data, response: res };
}

