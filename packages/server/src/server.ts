import express from "express";
import { createServer as createHttp, Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import path from "node:path";
import { promises as fs } from "node:fs";
import { loadChallenge } from "@blockgame/shared";

export interface HttpBootstrap {
  port: number;
  challengesDir?: string;
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
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
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

  // Serve target-image.png and any challenge assets
  app.use("/challenges", express.static(challengesDir));

  const http = createHttp(app);
  const wss = new WebSocketServer({ server: http, path: "/ws" });
  wss.on("connection", (ws: WebSocket) => {
    ws.send(JSON.stringify({ type: "hello" }));
  });
  http.listen(opts.port);
  return { app, http, wss };
}
