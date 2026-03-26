import type { Command } from "commander";
import { apiRequest } from "../http.js";

type EnvItem = {
  id: string;
  name: string;
  type?: string;
  updatedAt?: string;
};

export function registerEnvsCommand(program: Command) {
  program
    .command("envs")
    .description("List environments in a project")
    .argument("<projectId>", "Project ID")
    .option("--api <url>", "API base URL (e.g. http://localhost:4000/api/v1)")
    .action(async (projectId: string, opts: { api?: string }) => {
      const { data } = await apiRequest<EnvItem[]>(
        "GET",
        `/projects/${encodeURIComponent(projectId)}/environments`,
        { apiBaseUrl: opts.api },
      );

      if (!data.length) {
        process.stdout.write("No environments found.\n");
        return;
      }

      for (const e of data) {
        const t = e.type ? ` (${e.type})` : "";
        process.stdout.write(`${e.id}\t${e.name}${t}\n`);
      }
    });
}

