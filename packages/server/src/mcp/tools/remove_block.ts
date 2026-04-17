import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export interface RemoveBlockArgs {
  block_id: string;
}

export interface RemoveBlockData {
  removed: string;
}

export async function removeBlock(
  args: RemoveBlockArgs,
): Promise<ToolResult<RemoveBlockData>> {
  const ctx = getToolContext();
  if (!ctx.state.currentTurn) {
    return err(
      "INTENT_NOT_LOGGED",
      "Call record_user_intent first",
      "The current turn expired (>30s) or was never started.",
    );
  }
  const b = ctx.state.removeBlock(args.block_id);
  if (!b) return err("UNKNOWN_BLOCK_ID", `no block with id ${args.block_id}`);
  ctx.state.logToolCall({
    turn_id: ctx.state.currentTurn.turn_id,
    user_intent: ctx.state.currentTurn.user_intent,
    tool_name: "remove_block",
    args: args as unknown as Record<string, unknown>,
    result_summary: `removed ${args.block_id}`,
  });
  ctx.broadcaster.emit({ type: "block_removed", id: args.block_id });
  return ok({ removed: args.block_id });
}

export const removeBlockDef = {
  name: "remove_block",
  description: "Remove a block by its id.",
  schema: {
    type: "object",
    properties: { block_id: { type: "string" } },
    required: ["block_id"],
  },
  handler: removeBlock,
};
