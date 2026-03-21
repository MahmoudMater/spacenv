import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import type { ApiError } from "@/types";

/** Trailing slashes stripped; paths are relative to this (e.g. `/api/v1`). */
export const API_BASE_URL = (
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : ""
).replace(/\/+$/, "");

function resolvePathname(config: InternalAxiosRequestConfig): string {
  const base = config.baseURL ?? "";
  const rel = config.url ?? "";
  try {
    return new URL(rel, base.endsWith("/") ? base : `${base}/`).pathname;
  } catch {
    return rel;
  }
}

/** Paths are resolved from full URL (e.g. `/api/v1/auth/login` when base is `/api/v1`). */
function isAuthExemptPath(pathname: string): boolean {
  return (
    pathname.endsWith("/auth/login") ||
    pathname.endsWith("/auth/register") ||
    pathname.endsWith("/auth/refresh")
  );
}

export function normalizeAxiosError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return normalizeFromAxiosError(error);
  }
  return {
    statusCode: 500,
    message: error instanceof Error ? error.message : "Unknown error",
    error: "Error",
  };
}

function normalizeFromAxiosError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 500;
  const body = error.response?.data as
    | {
        statusCode?: number;
        message?: string | string[];
        error?: string;
      }
    | undefined;

  let message = error.message || "Request failed";
  if (body?.message !== undefined) {
    message = Array.isArray(body.message)
      ? body.message.join(", ")
      : String(body.message);
  }

  const errorName =
    typeof body?.error === "string" ? body.error : error.code || "Error";

  return {
    statusCode: body?.statusCode ?? status,
    message,
    error: errorName,
  };
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const apiError = normalizeFromAxiosError(error);
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (!original || status !== 401) {
      return Promise.reject(apiError);
    }

    const pathname = resolvePathname(original);

    if (isAuthExemptPath(pathname)) {
      if (pathname.endsWith("/auth/refresh") && typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(apiError);
    }

    if (original._retry) {
      return Promise.reject(apiError);
    }

    original._retry = true;

    try {
      await apiClient.post("/auth/refresh");
      return apiClient.request(original);
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(apiError);
    }
  },
);
