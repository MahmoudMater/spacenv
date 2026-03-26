import type { Command } from "commander";
import { apiRequest } from "../http.js";

type SpaceItem = {
  id: string;
  name: string;
  description?: string | null;
  viewerMembership?: "OWNER" | "MEMBER";
  updatedAt?: string;
};

export function registerSpacesCommand(program: Command) {
  program
    .command("spaces")
    .description("List spaces for the current user")
    .option("--api <url>", "API base URL (e.g. http://localhost:4000/api/v1)")
    .action(async (opts: { api?: string }) => {
      const { data } = await apiRequest<SpaceItem[]>("GET", "/spaces", {
        apiBaseUrl: opts.api,
      });

      if (!data.length) {
        process.stdout.write("No spaces found.\n");
        return;
      }

      for (const s of data) {
        const role = s.viewerMembership ? ` (${s.viewerMembership})` : "";
        process.stdout.write(`${s.id}\t${s.name}${role}\n`);
      }
    });
}

