import { ok, type ToolResult, type Track, type Vec3 } from "@blockgame/shared";
import { placeBlock } from "./place_block.js";

export interface PlaceWallArgs {
  track: Track;
  type: string;
  color: string;
  start: Vec3;
  end: Vec3;
  height: number;
}

export async function placeWall(
  a: PlaceWallArgs,
): Promise<ToolResult<{ blocks_placed: number }>> {
  // axis detection (assume wall lies along x or y)
  const dx = a.end[0] - a.start[0];
  const dy = a.end[1] - a.start[1];
  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  const length = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
  const ids: string[] = [];
  for (let i = 0; i < length; i++) {
    for (let h = 0; h < a.height; h++) {
      const pos: Vec3 = [
        a.start[0] + i * stepX,
        a.start[1] + i * stepY,
        a.start[2] + h,
      ];
      const res = await placeBlock({
        track: a.track,
        type: a.type,
        position: pos,
        color: a.color,
      });
      if (res.ok) ids.push(res.data.block_id);
    }
  }
  return ok({ blocks_placed: ids.length });
}

export const placeWallDef = {
  name: "place_wall",
  description:
    "Efficiently place a rectangular wall of blocks (bonus score).",
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
      end: {
        type: "array",
        items: { type: "number" },
        minItems: 3,
        maxItems: 3,
      },
      height: { type: "number" },
    },
    required: ["track", "type", "color", "start", "end", "height"],
  },
  handler: placeWall,
};
