#!/usr/bin/env node
import { startHttp } from "./server.js";
import open from "open";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GameState } from "./state/game-state.js";
import { Broadcaster } from "./transport/ws-broadcaster.js";
import { setToolContext } from "./mcp/tool-context.js";
import { saveSession, loadSession, defaultSessionDir } from "./state/persistence.js";
import { registerAllTools } from "./mcp/index.js";

/** Locate the built web-app's dist directory. Returns null if not found
 * (dev-mode running from src/, or a broken install). */
function resolveWebAppDir(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Production: postbuild copies web-app/dist into dist/web-app of the server
  const bundled = path.resolve(here, "web-app");
  if (existsSync(path.join(bundled, "index.html"))) return bundled;
  // Dev: walk up to monorepo root and look at packages/web-app/dist
  const devPath = path.resolve(here, "..", "..", "..", "web-app", "dist");
  if (existsSync(path.join(devPath, "index.html"))) return devPath;
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const resumeFlag = args.indexOf("--resume");
  const noBrowser = args.includes("--no-browser");
  const isDev = args.includes("--dev");

  let state: GameState;
  if (resumeFlag >= 0) {
    const id = args[resumeFlag + 1];
    if (!id) {
      console.error("--resume requires a session id");
      process.exit(1);
    }
    state = await loadSession(id, defaultSessionDir());
  } else {
    state = new GameState(randomUUID());
  }

  const broadcaster = new Broadcaster();
  setToolContext({ state, broadcaster });
  registerAllTools();

  const port = 7788;
  // In dev mode, vite middleware serves the UI with HMR — skip the static dist.
  // In prod (or when launched without --dev) we serve the bundled web-app/dist.
  const webAppDir = isDev ? null : resolveWebAppDir();
  const { app, wss, http } = startHttp({
    port,
    webAppDir: webAppDir ?? undefined,
  });
  wss.on("connection", (ws) => {
    const off = broadcaster.subscribe((m) => {
      try {
        ws.send(JSON.stringify(m));
      } catch {
        /* ignore */
      }
    });
    ws.on("close", off);
  });

  // ── Dev: mount Vite as middleware so the UI + HMR live on :7788 too ──
  // Single process, single port. HMR uses a hidden separate ws port (24678) to
  // avoid colliding with our /ws app channel.
  if (isDev) {
    try {
      const here = path.dirname(fileURLToPath(import.meta.url));
      // here = packages/server/src (via tsx). Up two = packages/, then /web-app.
      const webAppRoot = path.resolve(here, "..", "..", "web-app");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: webAppRoot,
        server: { middlewareMode: true, hmr: { port: 24678 } },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.error(
        `[blockgame] dev mode — vite middleware mounted (HMR ws on :24678)`,
      );
    } catch (e) {
      console.error(
        `[blockgame] dev mode failed to start vite: ${(e as Error).message}`,
      );
      console.error(`  Falling back to API-only. Run \`pnpm --filter @blockgame/web-app dev\` separately.`);
    }
  }
  void http;

  // Auto-save every 2s
  const saveInterval = setInterval(() => {
    saveSession(state, defaultSessionDir()).catch(() => {});
  }, 2_000);

  // Graceful shutdown
  const cleanup = () => {
    clearInterval(saveInterval);
    saveSession(state, defaultSessionDir())
      .catch(() => {})
      .then(() => process.exit(0));
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Single port for everything: API + WS + UI (vite middleware in dev, static
  // dist in prod). One process, one URL.
  const uiUrl = `http://localhost:${port}`;
  if (!noBrowser) {
    open(uiUrl).catch(() => {});
  }
  console.error(
    `[blockgame] session ${state.id} started on :${port}\n` +
      `Register MCP: claude mcp add blockgame -- npx blockgame-mcp\n` +
      `Web UI: ${uiUrl}${isDev ? " (dev — Vite HMR on :24678)" : ""}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
