#!/usr/bin/env node
/**
 * Post-build: ensure CLI entries have #!/usr/bin/env node shebang and are executable.
 * tsc does not preserve shebangs from .ts source files.
 */
import { readFileSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "..", "dist");
const entries = ["cli.js", "mcp-cli.js"];

for (const name of entries) {
  const f = resolve(distDir, name);
  if (!existsSync(f)) {
    console.error(`[postbuild] missing ${f}`);
    process.exit(1);
  }
  const src = readFileSync(f, "utf8");
  if (!src.startsWith("#!")) {
    writeFileSync(f, "#!/usr/bin/env node\n" + src, "utf8");
  }
  chmodSync(f, 0o755);
}
console.error(`[postbuild] shebangs + chmod ok: ${entries.join(", ")}`);
