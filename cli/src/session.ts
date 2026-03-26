import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type CliSession = {
  apiBaseUrl?: string;
  cookie?: string; // value for `Cookie:` header (e.g. "access_token=...; refresh_token=...")
};

function configDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg && xdg.trim()) return xdg;
  return path.join(os.homedir(), ".config");
}

function sessionPath(): string {
  return path.join(configDir(), "spacenv", "session.json");
}

export async function readSession(): Promise<CliSession> {
  try {
    const raw = await fs.readFile(sessionPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const obj = parsed as Record<string, unknown>;
    return {
      apiBaseUrl: typeof obj.apiBaseUrl === "string" ? obj.apiBaseUrl : undefined,
      cookie: typeof obj.cookie === "string" ? obj.cookie : undefined,
    };
  } catch {
    return {};
  }
}

export async function writeSession(next: CliSession): Promise<void> {
  const file = sessionPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2) + "\n", "utf8");
  await fs.chmod(tmp, 0o600);
  await fs.rename(tmp, file);
}

export async function clearSession(): Promise<void> {
  await writeSession({});
}

