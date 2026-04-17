import { ok, err, type ToolResult, type Vec3 } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export interface MoveBlockArgs {
  block_id: string;
  new_position: Vec3;
}

export async function moveBlock(
  args: MoveBlockArgs,
): Promise<ToolResult<Record<string, never>>> {
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
  b.position = args.new_position;
  ctx.state.logToolCall({
    turn_id: ctx.state.currentTurn.turn_id,
    user_intent: ctx.state.currentTurn.user_intent,
    tool_name: "move_block",
    args: args as unknown as Record<string, unknown>,
    result_summary: `moved ${args.block_id}`,
  });
  ctx.broadcaster.emit({ type: "block_removed", id: args.block_id });
  ctx.broadcaster.emit({ type: "block_added", block: b });
  return ok({});
}

export const moveBlockDef = {
  name: "move_block",
  description: "Move an existing block to a new position.",
  schema: {
    type: "object",
    properties: {
      block_id: { type: "string" },
      new_position: {
        type: "array",
        items: { type: "number" },
        minItems: 3,
        maxItems: 3,
      },
    },
    required: ["block_id", "new_position"],
  },
  handler: moveBlock,
};
