#!/usr/bin/env node
/**
 * Post-build: ensure CLI entries have #!/usr/bin/env node shebang and are
 * executable, then bundle the web-app's build into dist/web-app so the
 * `blockgame` CLI can serve the UI itself (no separate Vite in production).
 */
import { readFileSync, writeFileSync, chmodSync, existsSync, cpSync, rmSync } from "node:fs";
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

// Bundle web-app build into server dist (served statically by cli.ts).
const webAppDist = resolve(here, "..", "..", "web-app", "dist");
const bundled = resolve(distDir, "web-app");
if (existsSync(resolve(webAppDist, "index.html"))) {
  rmSync(bundled, { recursive: true, force: true });
  cpSync(webAppDist, bundled, { recursive: true });
  console.error(`[postbuild] bundled web-app → ${bundled}`);
} else {
  console.error(
    `[postbuild] skipped web-app bundle (not built yet — run pnpm --filter @blockgame/web-app build first)`,
  );
}

console.error(`[postbuild] shebangs + chmod ok: ${entries.join(", ")}`);
