import fs from "node:fs/promises";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/add-shebang.mjs <file>");
  process.exit(2);
}

const raw = await fs.readFile(file, "utf8");
if (raw.startsWith("#!")) process.exit(0);

const next = `#!/usr/bin/env node\n${raw}`;
await fs.writeFile(file, next, "utf8");

