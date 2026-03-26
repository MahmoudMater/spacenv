import type { Command } from "commander";
import { apiRequest } from "../http.js";

type ProjectItem = {
  id: string;
  name: string;
  description?: string | null;
  spaceId?: string;
  updatedAt?: string;
};

export function registerProjectsCommand(program: Command) {
  program
    .command("projects")
    .description("List projects in a space")
    .argument("<spaceId>", "Space ID")
    .option("--api <url>", "API base URL (e.g. http://localhost:4000/api/v1)")
    .action(async (spaceId: string, opts: { api?: string }) => {
      const { data } = await apiRequest<ProjectItem[]>(
        "GET",
        `/spaces/${encodeURIComponent(spaceId)}/projects`,
        { apiBaseUrl: opts.api },
      );

      if (!data.length) {
        process.stdout.write("No projects found.\n");
        return;
      }

      for (const p of data) {
        process.stdout.write(`${p.id}\t${p.name}\n`);
      }
    });
}

