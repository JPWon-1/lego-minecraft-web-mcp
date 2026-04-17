import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function resetScene(): Promise<ToolResult<{ cleared: number }>> {
  const ctx = getToolContext();
  if (!ctx.state.currentTurn) {
    return err(
      "INTENT_NOT_LOGGED",
      "Call record_user_intent first",
      "The current turn expired (>30s) or was never started.",
    );
  }
  const n = ctx.state.scene.blocks.length;
  ctx.state.reset();
  ctx.state.logToolCall({
    turn_id: ctx.state.currentTurn.turn_id,
    user_intent: ctx.state.currentTurn.user_intent,
    tool_name: "reset_scene",
    args: {},
    result_summary: `cleared ${n}`,
  });
  ctx.broadcaster.emit({ type: "scene_reset" });
  return ok({ cleared: n });
}

export const resetSceneDef = {
  name: "reset_scene",
  description: "Clear all placed blocks. Free, no penalty.",
  schema: { type: "object", properties: {} },
  handler: resetScene,
};
