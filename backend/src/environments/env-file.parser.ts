/** Parse pasted .env text: skip blanks and # comments; split on first `=` only. */
export function parseRawEnvLines(
  rawEnv: string,
): Array<{ key: string; value: string }> {
  const lines = rawEnv.split(/\r?\n/);
  const out: Array<{ key: string; value: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (!key) {
      continue;
    }
    const value = trimmed.slice(eq + 1);
    out.push({ key, value });
  }

  return out;
}
