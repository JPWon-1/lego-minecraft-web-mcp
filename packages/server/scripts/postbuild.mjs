#!/usr/bin/env node
/**
 * Post-build:
 *  1) Ensure CLI entries have #!/usr/bin/env node shebang and are executable.
 *  2) Bundle the web-app's build into dist/web-app so `blockgame` serves UI
 *     without a separate Vite.
 *  3) Bundle dist/cli.js and dist/mcp-cli.js with esbuild — inlines the
 *     `@blockgame/shared` workspace package so the published npm tarball is
 *     self-contained (no workspace-protocol dependency).
 */
import { readFileSync, writeFileSync, chmodSync, existsSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build as esbuild } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "..", "dist");
const entries = ["cli.js", "mcp-cli.js"];

// 1) Bundle each entry with esbuild — inline @blockgame/shared, externalize
//    real npm dependencies (express, ws, vite, etc. — installed by npm at the
//    user's machine).
const externals = [
  "express",
  "ws",
  "open",
  "@modelcontextprotocol/sdk",
  "vite",
  // node built-ins are auto-external when platform=node
];

for (const name of entries) {
  const inFile = resolve(distDir, name);
  if (!existsSync(inFile)) {
    console.error(`[postbuild] missing ${inFile}`);
    process.exit(1);
  }
  await esbuild({
    entryPoints: [inFile],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "esm",
    outfile: inFile,
    allowOverwrite: true,
    external: externals,
    logLevel: "warning",
  });
  // tsc preserves the shebang in dist/cli.ts but esbuild strips it during
  // bundling. Re-add and chmod.
  const out = readFileSync(inFile, "utf8");
  if (!out.startsWith("#!")) {
    writeFileSync(inFile, "#!/usr/bin/env node\n" + out, "utf8");
  }
  chmodSync(inFile, 0o755);
}
console.error(`[postbuild] esbuild bundled: ${entries.join(", ")}`);

// 2) Bundle web-app build into server dist (served statically by cli.ts).
const webAppDist = resolve(here, "..", "..", "web-app", "dist");
const bundledUi = resolve(distDir, "web-app");
if (existsSync(resolve(webAppDist, "index.html"))) {
  rmSync(bundledUi, { recursive: true, force: true });
  cpSync(webAppDist, bundledUi, { recursive: true });
  console.error(`[postbuild] bundled web-app → ${bundledUi}`);
} else {
  console.error(
    `[postbuild] skipped web-app bundle (not built yet — run pnpm --filter @blockgame/web-app build first)`,
  );
}
