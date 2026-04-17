import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function undo(): Promise<ToolResult<{ undone_action: string }>> {
  const ctx = getToolContext();
  if (!ctx.state.currentTurn) {
    return err(
      "INTENT_NOT_LOGGED",
      "Call record_user_intent first",
      "The current turn expired (>30s) or was never started.",
    );
  }
  const last = ctx.state.scene.blocks.pop();
  if (!last) return err("INTERNAL", "nothing to undo");
  ctx.state.logToolCall({
    turn_id: ctx.state.currentTurn.turn_id,
    user_intent: ctx.state.currentTurn.user_intent,
    tool_name: "undo",
    args: {},
    result_summary: `undone ${last.id}`,
  });
  ctx.broadcaster.emit({ type: "block_removed", id: last.id });
  return ok({ undone_action: `removed block ${last.id}` });
}

export const undoDef = {
  name: "undo",
  description: "Undo the last placement.",
  schema: { type: "object", properties: {} },
  handler: undo,
};
