import { Command } from "commander";
import { registerLoginCommand } from "./commands/login.js";
import { registerLogoutCommand } from "./commands/logout.js";
import { registerSpacesCommand } from "./commands/spaces.js";
import { registerProjectsCommand } from "./commands/projects.js";
import { registerEnvsCommand } from "./commands/envs.js";
import { registerPullCommand } from "./commands/pull.js";

const program = new Command();

program.name("spacenv").description("Spacenv CLI").version("0.0.0");

registerLoginCommand(program);
registerLogoutCommand(program);
registerSpacesCommand(program);
registerProjectsCommand(program);
registerEnvsCommand(program);
registerPullCommand(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});

