import type { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { apiRequest } from "../http.js";

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export function registerPullCommand(program: Command) {
  program
    .command("pull")
    .description("Download an environment's decrypted .env and write it locally")
    .requiredOption("--env <envId>", "Environment ID")
    .option(
      "--out <path>",
      "Output file path (default: ./.env). If a directory, writes into it.",
    )
    .option("--force", "Overwrite if output file exists", false)
    .option("--api <url>", "API base URL (e.g. http://localhost:4000/api/v1)")
    .action(
      async (opts: { env: string; out?: string; force: boolean; api?: string }) => {
        const envId = opts.env;
        const outArg = opts.out ?? ".env";

        const { data, response } = await apiRequest<string>(
          "GET",
          `/environments/${encodeURIComponent(envId)}/download`,
          {
            apiBaseUrl: opts.api,
            headers: { Accept: "text/plain" },
          },
        );

        let outPath = outArg;
        try {
          const st = await fs.stat(outArg);
          if (st.isDirectory()) {
            outPath = path.join(outArg, ".env");
          }
        } catch {
          // not a directory / doesn't exist
        }

        if (!opts.force && (await fileExists(outPath))) {
          throw new Error(
            `Refusing to overwrite existing file: ${outPath} (use --force)`,
          );
        }

        await fs.writeFile(outPath, data, "utf8");

        const cd = response.headers.get("content-disposition");
        const remoteName = cd?.includes("filename=") ? cd : undefined;

        process.stdout.write(`Wrote ${outPath}\n`);
        if (remoteName) process.stdout.write(`Remote: ${remoteName}\n`);
      },
    );
}

