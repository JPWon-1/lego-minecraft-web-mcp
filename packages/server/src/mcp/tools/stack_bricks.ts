import { ok, type ToolResult, type Vec3, type Rotation } from "@blockgame/shared";
import { placeBlock } from "./place_block.js";

export interface BrickSpec {
  type: string;
  color: string;
  rotation?: Rotation;
}

export async function stackBricks(args: {
  base: Vec3;
  sequence: BrickSpec[];
}): Promise<ToolResult<{ blocks_placed: number }>> {
  let placed = 0;
  let [x, y, z] = args.base;
  for (const spec of args.sequence) {
    const r = await placeBlock({
      track: "lego",
      type: spec.type,
      position: [x, y, z],
      color: spec.color,
      rotation: spec.rotation,
    });
    if (r.ok) {
      placed++;
      z += 1;
    }
  }
  return ok({ blocks_placed: placed });
}

export const stackBricksDef = {
  name: "stack_bricks",
  description: "Stack multiple LEGO bricks vertically at a base position.",
  schema: {
    type: "object",
    properties: {
      base: {
        type: "array",
        items: { type: "number" },
        minItems: 3,
        maxItems: 3,
      },
      sequence: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            color: { type: "string" },
            rotation: { type: "number", enum: [0, 90, 180, 270] },
          },
          required: ["type", "color"],
        },
      },
    },
    required: ["base", "sequence"],
  },
  handler: stackBricks,
};
