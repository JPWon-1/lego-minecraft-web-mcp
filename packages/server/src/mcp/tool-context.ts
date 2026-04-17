import { GameState } from "../state/game-state.js";
import { Broadcaster } from "../transport/ws-broadcaster.js";

export interface ToolCtx {
  state: GameState;
  broadcaster: Broadcaster;
}

let _ctx: ToolCtx | undefined;

export function setToolContext(c: ToolCtx): void {
  _ctx = c;
}

export function getToolContext(): ToolCtx {
  if (!_ctx) throw new Error("tool context not initialized");
  return _ctx;
}

export function resetToolContextForTests(): void {
  _ctx = undefined;
}
