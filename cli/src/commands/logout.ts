import type { Command } from "commander";
import { apiRequest } from "../http.js";
import { clearSession, readSession } from "../session.js";

export function registerLogoutCommand(program: Command) {
  program
    .command("logout")
    .description("Logout and clear the local session")
    .option("--api <url>", "API base URL (e.g. http://localhost:4000/api/v1)")
    .action(async (opts: { api?: string }) => {
      const session = await readSession();
      const apiBaseUrl = opts.api ?? session.apiBaseUrl;

      // Best-effort: if session is missing/expired, still clear locally.
      try {
        await apiRequest("POST", "/auth/logout", {
          apiBaseUrl,
          cookie: session.cookie,
        });
      } catch {
        // ignore
      }

      await clearSession();
      process.stdout.write("Logged out.\n");
    });
}

