import {
  ok,
  err,
  type ToolResult,
  type Track,
  type Vec3,
  type Rotation,
  type Block,
} from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

let _idCounter = 0;
function newBlockId(): string {
  _idCounter++;
  return `bk-${Date.now().toString(36)}-${_idCounter}`;
}

export interface PlaceBlockArgs {
  track: Track;
  type: string;
  position: Vec3;
  color: string;
  rotation?: Rotation;
}

export interface PlaceBlockData {
  block_id: string;
}

export async function placeBlock(
  args: PlaceBlockArgs,
): Promise<ToolResult<PlaceBlockData>> {
  const ctx = getToolContext();
  if (!ctx.state.currentTurn) {
    return err(
      "INTENT_NOT_LOGGED",
      "Call record_user_intent first",
      "The current turn expired (>30s) or was never started.",
    );
  }
  const id = newBlockId();
  const block: Block = {
    id,
    track: args.track,
    type: args.type,
    position: args.position,
    color: args.color,
    rotation: args.rotation,
    placed_at: Date.now(),
    turn_id: ctx.state.currentTurn.turn_id,
  };
  ctx.state.addBlock(block);
  ctx.state.logToolCall({
    turn_id: block.turn_id,
    user_intent: ctx.state.currentTurn.user_intent,
    tool_name: "place_block",
    args: args as unknown as Record<string, unknown>,
    result_summary: `placed ${id}`,
  });
  ctx.broadcaster.emit({ type: "block_added", block });
  return ok({ block_id: id });
}

export const placeBlockDef = {
  name: "place_block",
  description: "Place a single block at the given grid position.",
  schema: {
    type: "object",
    properties: {
      track: { type: "string", enum: ["minecraft", "lego"] },
      type: { type: "string" },
      position: {
        type: "array",
        items: { type: "number" },
        minItems: 3,
        maxItems: 3,
      },
      color: { type: "string" },
      rotation: { type: "number", enum: [0, 90, 180, 270] },
    },
    required: ["track", "type", "position", "color"],
  },
  handler: placeBlock,
};
