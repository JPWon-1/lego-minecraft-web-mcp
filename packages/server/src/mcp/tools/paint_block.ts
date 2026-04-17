import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function paintBlock(args: {
  block_id: string;
  new_color: string;
}): Promise<ToolResult<Record<string, never>>> {
  const ctx = getToolContext();
  if (!ctx.state.currentTurn) {
    return err(
      "INTENT_NOT_LOGGED",
      "Call record_user_intent first",
      "The current turn expired (>30s) or was never started.",
    );
  }
  const b = ctx.state.scene.blocks.find((x) => x.id === args.block_id);
  if (!b) return err("UNKNOWN_BLOCK_ID", `no block ${args.block_id}`);
  b.color = args.new_color;
  ctx.state.logToolCall({
    turn_id: ctx.state.currentTurn.turn_id,
    user_intent: ctx.state.currentTurn.user_intent,
    tool_name: "paint_block",
    args: args as unknown as Record<string, unknown>,
    result_summary: `painted ${args.block_id}`,
  });
  ctx.broadcaster.emit({ type: "block_removed", id: b.id });
  ctx.broadcaster.emit({ type: "block_added", block: b });
  return ok({});
}

export const paintBlockDef = {
  name: "paint_block",
  description: "Change the color of an existing block (Minecraft track).",
  schema: {
    type: "object",
    properties: {
      block_id: { type: "string" },
      new_color: { type: "string" },
    },
    required: ["block_id", "new_color"],
  },
  handler: paintBlock,
};
