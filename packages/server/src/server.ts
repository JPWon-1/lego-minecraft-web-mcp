import express from "express";
import { createServer as createHttp, Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

export interface HttpBootstrap {
  port: number;
}

export interface HttpHandle {
  app: express.Express;
  http: HttpServer;
  wss: WebSocketServer;
}

export function startHttp(opts: HttpBootstrap): HttpHandle {
  const app = express();
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  const http = createHttp(app);
  const wss = new WebSocketServer({ server: http, path: "/ws" });
  wss.on("connection", (ws: WebSocket) => {
    ws.send(JSON.stringify({ type: "hello" }));
  });
  http.listen(opts.port);
  return { app, http, wss };
}
