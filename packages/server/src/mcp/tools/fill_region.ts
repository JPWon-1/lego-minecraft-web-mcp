import { ok, type ToolResult, type Vec3 } from "@blockgame/shared";
import { placeBlock } from "./place_block.js";

export async function fillRegion(args: {
  box: [Vec3, Vec3];
  color: string;
  type?: string;
}): Promise<ToolResult<{ blocks_placed: number }>> {
  const [a, b] = args.box;
  const type = args.type ?? "voxel_1x1";
  let placed = 0;
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;
  const [x0, x1] = [Math.min(ax, bx), Math.max(ax, bx)];
  const [y0, y1] = [Math.min(ay, by), Math.max(ay, by)];
  const [z0, z1] = [Math.min(az, bz), Math.max(az, bz)];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      for (let z = z0; z <= z1; z++) {
        const r = await placeBlock({
          track: "minecraft",
          type,
          position: [x, y, z],
          color: args.color,
        });
        if (r.ok) placed++;
      }
    }
  }
  return ok({ blocks_placed: placed });
}

export const fillRegionDef = {
  name: "fill_region",
  description: "Fill a 3D box region with blocks (Minecraft track).",
  schema: {
    type: "object",
    properties: {
      box: {
        type: "array",
        items: {
          type: "array",
          items: { type: "number" },
          minItems: 3,
          maxItems: 3,
        },
        minItems: 2,
        maxItems: 2,
      },
      color: { type: "string" },
      type: { type: "string" },
    },
    required: ["box", "color"],
  },
  handler: fillRegion,
};
