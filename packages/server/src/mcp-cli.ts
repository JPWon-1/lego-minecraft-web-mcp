#!/usr/bin/env node
/**
 * Stdio entry for Claude Code MCP integration.
 * The plan's Task 6 notes the MCP SDK wiring is a thin stub. This entry just
 * delegates to listTools/callTool via stdin/stdout JSON protocol as a fallback.
 * For production, replace with @modelcontextprotocol/sdk Server + StdioServerTransport.
 */

import { listTools, callTool } from "./mcp/server.js";
import { registerAllTools } from "./mcp/index.js";
import { GameState } from "./state/game-state.js";
import { Broadcaster } from "./transport/ws-broadcaster.js";
import { setToolContext } from "./mcp/tool-context.js";
import { randomUUID } from "node:crypto";

async function main() {
  // Initialize a fresh session for this MCP connection
  // NOTE: In production, the HTTP cli.ts and mcp-cli.ts should share state via IPC or file.
  // For MVP, each mcp-cli invocation is its own session. Task 27+ integration.
  const state = new GameState(randomUUID());
  const broadcaster = new Broadcaster();
  setToolContext({ state, broadcaster });
  registerAllTools();

  // Simple JSONL stdin/stdout protocol
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
          process.stdout.write(JSON.stringify({ id: req.id, tools: listTools() }) + "\n");
        } else if (req.method === "tools/call") {
          const result = await callTool(req.params.name, req.params.arguments);
          process.stdout.write(JSON.stringify({ id: req.id, result }) + "\n");
        }
      } catch (e) {
        process.stderr.write(`[mcp-cli] error: ${(e as Error).message}\n`);
      }
    }
  });

  process.stderr.write("[blockgame-mcp] stdio ready\n");
}

main();
