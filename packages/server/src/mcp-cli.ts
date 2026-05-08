#!/usr/bin/env node
/**
 * Stdio entry used by Claude Desktop / Claude Code as an MCP server.
 *
 * Plan-B install: this single process also boots the HTTP + WebSocket UI
 * server on :7788, so the user only needs the MCP entry in their
 * claude_desktop_config and a browser pops open automatically. No separate
 * `blockgame` invocation needed.
 *
 * If :7788 is taken (e.g. another Claude conversation already started a
 * sibling), we keep the stdio handler alive but skip the HTTP boot. The
 * earlier-started instance owns the UI and the user sees it there.
 */

import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import open from "open";

import { listTools, callTool } from "./mcp/server.js";
import { registerAllTools } from "./mcp/index.js";
import { GameState } from "./state/game-state.js";
import { Broadcaster } from "./transport/ws-broadcaster.js";
import { setToolContext } from "./mcp/tool-context.js";
import { startHttp } from "./server.js";
import {
  saveSession,
  loadSession,
  defaultSessionDir,
} from "./state/persistence.js";

/** Locate the bundled web-app's dist directory (production) or the dev path. */
function resolveWebAppDir(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const bundled = path.resolve(here, "web-app");
  if (existsSync(path.join(bundled, "index.html"))) return bundled;
  const devPath = path.resolve(here, "..", "..", "..", "web-app", "dist");
  if (existsSync(path.join(devPath, "index.html"))) return devPath;
  return null;
}

const HTTP_PORT = 7788;

async function main() {
  // CRITICAL: stdout is reserved for MCP JSONL responses. Every other log
  // line MUST go to stderr or Claude will see garbage on the protocol stream.

  // Try to resume a recent session so a Claude restart doesn't drop work.
  const sessionDir = defaultSessionDir();
  const args = process.argv.slice(2);
  const resumeFlag = args.indexOf("--resume");
  let state: GameState;
  if (resumeFlag >= 0 && args[resumeFlag + 1]) {
    state = await loadSession(args[resumeFlag + 1], sessionDir);
  } else {
    state = new GameState(randomUUID());
  }

  const broadcaster = new Broadcaster();
  setToolContext({ state, broadcaster });
  registerAllTools();

  // Try to also serve the web UI from this same process. If the port is
  // already taken (sibling MCP instance, or user started `blockgame`
  // separately), gracefully degrade to stdio-only.
  const webAppDir = resolveWebAppDir();
  let httpStarted = false;
  try {
    const { http, wss } = startHttp({
      port: HTTP_PORT,
      webAppDir: webAppDir ?? undefined,
    });
    // Bind happens async on next tick. Listen for success on the http server
    // and for errors on BOTH http and the wss (port-bind failures bubble to
    // the WebSocketServer too because it shares the http instance).
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const onOk = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const onErr = (e: Error) => {
        if (settled) return;
        settled = true;
        reject(e);
      };
      http.once("listening", onOk);
      http.once("error", onErr);
      wss.once("error", onErr);
    });
    httpStarted = true;
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

    // Auto-save so a crash or Claude restart doesn't lose state.
    const saveInterval = setInterval(() => {
      saveSession(state, sessionDir).catch(() => {});
    }, 2_000);

    const cleanup = () => {
      clearInterval(saveInterval);
      saveSession(state, sessionDir).catch(() => {});
    };
    process.on("SIGINT", () => {
      cleanup();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });
    process.on("exit", cleanup);

    // Pop the browser open on first launch only. The MCP_NO_BROWSER env var
    // lets headless / CI users skip this.
    if (!process.env.MCP_NO_BROWSER) {
      const uiUrl = webAppDir
        ? `http://localhost:${HTTP_PORT}`
        : "http://localhost:5173";
      open(uiUrl).catch(() => {});
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("EADDRINUSE")) {
      process.stderr.write(
        `[blockgame-mcp] port ${HTTP_PORT} busy — another instance likely owns the web UI; stdio-only mode\n`,
      );
    } else {
      process.stderr.write(`[blockgame-mcp] http boot failed: ${msg}\n`);
    }
  }

  // Stdio JSONL protocol — Claude speaks this to us regardless of HTTP state.
  process.stdin.setEncoding("utf8");
  let buffer = "";
  process.stdin.on("data", async (chunk) => {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (!line.trim()) continue;
      try {
        const req = JSON.parse(line);
        if (req.method === "tools/list") {
          process.stdout.write(
            JSON.stringify({ id: req.id, tools: listTools() }) + "\n",
          );
        } else if (req.method === "tools/call") {
          const result = await callTool(
            req.params.name,
            req.params.arguments,
          );
          process.stdout.write(
            JSON.stringify({ id: req.id, result }) + "\n",
          );
        }
      } catch (e) {
        process.stderr.write(
          `[blockgame-mcp] error: ${(e as Error).message}\n`,
        );
      }
    }
  });

  process.stderr.write(
    httpStarted
      ? `[blockgame-mcp] stdio + UI ready · http://localhost:${HTTP_PORT}\n`
      : `[blockgame-mcp] stdio ready (UI not bound on :${HTTP_PORT})\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`[blockgame-mcp] fatal: ${(err as Error).message}\n`);
  process.exit(1);
});
