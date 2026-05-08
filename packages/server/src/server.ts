import express from "express";
import { createServer as createHttp, Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import path from "node:path";
import { promises as fs } from "node:fs";
import { loadChallenge } from "@blockgame/shared";
import { callTool } from "./mcp/server.js";
import { getToolContext } from "./mcp/tool-context.js";

export interface HttpBootstrap {
  port: number;
  challengesDir?: string;
  /** Directory containing the built web-app (index.html + assets). When set,
   * the server also serves the web UI at `/`, so production installs only need
   * the `blockgame` process — no separate Vite. */
  webAppDir?: string;
}

export interface HttpHandle {
  app: express.Express;
  http: HttpServer;
  wss: WebSocketServer;
}

const CHALLENGE_ID_TO_SLUG: Record<string, string> = {
  "ch-001": "001-small-cabin",
  "ch-002": "002-grey-shed",
  "ch-003": "003-two-story",
  "ch-004": "004-tower",
  "ch-005": "005-l-shaped-villa",
};

export function startHttp(opts: HttpBootstrap): HttpHandle {
  const app = express();
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  const challengesDir =
    opts.challengesDir ?? path.resolve(process.cwd(), "challenges");

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/challenges", async (_req, res) => {
    const list = await Promise.all(
      Object.entries(CHALLENGE_ID_TO_SLUG).map(async ([id, slug]) => {
        try {
          const ch = await loadChallenge(path.join(challengesDir, slug));
          return {
            id,
            title: ch.manifest.title,
            difficulty: ch.manifest.difficulty,
            mode: ch.manifest.mode,
            grid_size: ch.manifest.grid_size,
            target_blocks_count: ch.voxelTarget.blocks.length,
          };
        } catch {
          return null;
        }
      }),
    );
    res.json({ challenges: list.filter(Boolean) });
  });

  app.get("/api/challenges/:id", async (req, res) => {
    const slug = CHALLENGE_ID_TO_SLUG[req.params.id];
    if (!slug) {
      res.status(404).json({ error: "not found" });
      return;
    }
    try {
      const ch = await loadChallenge(path.join(challengesDir, slug));
      let specMd = "";
      try {
        specMd = await fs.readFile(
          path.join(ch.dir, ch.manifest.target_spec_md),
          "utf8",
        );
      } catch {
        /* ignore */
      }
      res.json({
        manifest: ch.manifest,
        voxelTarget: ch.voxelTarget,
        specMd,
      });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  // Tool invocation endpoint — lets in-session proxies (e.g. chat frontend) drive the game
  app.use(express.json({ limit: "1mb" }));
  app.post("/api/tools/call", async (req, res) => {
    const { name, args } = req.body ?? {};
    if (!name || typeof name !== "string") {
      res.status(400).json({ ok: false, error: "name required" });
      return;
    }
    try {
      const result = await callTool(name, args ?? {});
      res.json(result);
    } catch (e) {
      res.status(500).json({ ok: false, error: (e as Error).message });
    }
  });

  app.post("/api/session/bind-challenge", (req, res) => {
    const { challenge_id } = req.body ?? {};
    const ctx = getToolContext();
    ctx.state.challenge_id = challenge_id;
    res.json({ ok: true, challenge_id });
  });

  app.get("/api/session", (_req, res) => {
    const ctx = getToolContext();
    res.json({
      id: ctx.state.id,
      challenge_id: ctx.state.challenge_id,
      block_count: ctx.state.scene.blocks.length,
      turns: ctx.state.turns.length,
      hints_used: ctx.state.hintsUsed,
    });
  });

  app.get("/api/session/full", (_req, res) => {
    const ctx = getToolContext();
    res.json(ctx.state.toSession());
  });

  // Serve target-image.png and any challenge assets
  app.use("/challenges", express.static(challengesDir));

  // Web UI: serve built web-app + SPA fallback so deep links like
  // "/#/challenges/ch-001" still resolve to index.html. API and WS routes
  // already matched above, so the catch-all below is safe.
  if (opts.webAppDir) {
    app.use(express.static(opts.webAppDir));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/ws") || req.path.startsWith("/challenges")) {
        return next();
      }
      res.sendFile(path.join(opts.webAppDir!, "index.html"));
    });
  }

  const http = createHttp(app);
  const wss = new WebSocketServer({ server: http, path: "/ws" });
  wss.on("connection", (ws: WebSocket) => {
    ws.send(JSON.stringify({ type: "hello" }));
    const ctx = getToolContext();
    ws.send(
      JSON.stringify({ type: "sync_state", session: ctx.state.toSession() }),
    );
  });
  http.listen(opts.port);
  return { app, http, wss };
}
