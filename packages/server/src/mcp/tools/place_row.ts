import { ok, type ToolResult, type Track, type Vec3 } from "@blockgame/shared";
import { placeBlock } from "./place_block.js";

export interface PlaceRowArgs {
  track: Track;
  type: string;
  color: string;
  start: Vec3;
  direction: "x" | "y" | "z";
  count: number;
}

export async function placeRow(
  a: PlaceRowArgs,
): Promise<ToolResult<{ blocks_placed: number }>> {
  const idx = a.direction === "x" ? 0 : a.direction === "y" ? 1 : 2;
  let placed = 0;
  for (let i = 0; i < a.count; i++) {
    const pos: Vec3 = [...a.start] as Vec3;
    pos[idx] += i;
    const r = await placeBlock({
      track: a.track,
      type: a.type,
      position: pos,
      color: a.color,
    });
    if (r.ok) placed++;
  }
  return ok({ blocks_placed: placed });
}

export const placeRowDef = {
  name: "place_row",
  description: "Place N blocks in a row along one axis (bonus score).",
  schema: {
    type: "object",
    properties: {
      track: { type: "string", enum: ["minecraft", "lego"] },
      type: { type: "string" },
      color: { type: "string" },
      start: {
        type: "array",
        items: { type: "number" },
        minItems: 3,
        maxItems: 3,
      },
      direction: { type: "string", enum: ["x", "y", "z"] },
      count: { type: "number" },
    },
    required: ["track", "type", "color", "start", "direction", "count"],
  },
  handler: placeRow,
};
