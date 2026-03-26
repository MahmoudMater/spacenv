import type { Command } from "commander";
import { apiRequest, cookieHeaderFromSetCookie } from "../http.js";
import { readSession, writeSession } from "../session.js";

type LoginResponse = {
  id: string;
  email: string;
  name?: string | null;
};

export function registerLoginCommand(program: Command) {
  program
    .command("login")
    .description("Login and store a local session")
    .requiredOption("--email <email>", "Email")
    .requiredOption("--password <password>", "Password")
    .option("--api <url>", "API base URL (e.g. http://localhost:4000/api/v1)")
    .action(async (opts: { email: string; password: string; api?: string }) => {
      const apiBaseUrl = opts.api;

      const { data, response } = await apiRequest<LoginResponse>(
        "POST",
        "/auth/login",
        {
          apiBaseUrl,
          json: { email: opts.email, password: opts.password },
        },
      );

      const setCookies =
        // Node/undici fetch supports getSetCookie()
        (response.headers as any).getSetCookie?.() ??
        (() => {
          const single = response.headers.get("set-cookie");
          return single ? [single] : [];
        })();

      const cookie = cookieHeaderFromSetCookie(setCookies);
      if (!cookie) {
        throw new Error(
          "Login succeeded but no cookies were returned (cannot create session).",
        );
      }

      const prev = await readSession();
      await writeSession({
        apiBaseUrl: apiBaseUrl ?? prev.apiBaseUrl,
        cookie,
      });

      process.stdout.write(`Logged in as ${data.email}\n`);
    });
}

