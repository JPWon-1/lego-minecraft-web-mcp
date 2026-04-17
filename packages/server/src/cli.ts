#!/usr/bin/env node
import { startHttp } from "./server.js";
import open from "open";
import { randomUUID } from "node:crypto";
import { GameState } from "./state/game-state.js";
import { Broadcaster } from "./transport/ws-broadcaster.js";
import { setToolContext } from "./mcp/tool-context.js";
import { saveSession, loadSession, defaultSessionDir } from "./state/persistence.js";
import { registerAllTools } from "./mcp/index.js";

async function main() {
  const args = process.argv.slice(2);
  const resumeFlag = args.indexOf("--resume");
  const noBrowser = args.includes("--no-browser");

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
  const { wss } = startHttp({ port });
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

  if (!noBrowser) {
    open("http://localhost:5173").catch(() => {});
  }

  console.error(
    `[blockgame] session ${state.id} started on :${port}\n` +
      `Register MCP: claude mcp add blockgame -- npx blockgame-mcp\n` +
      `Web UI: http://localhost:5173`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
