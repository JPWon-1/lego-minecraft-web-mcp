import { ok, type ToolResult, type Vec3 } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

const ANGLES: Record<string, { pos: Vec3; target: Vec3 }> = {
  front: { pos: [10, -15, 6], target: [0, 0, 0] },
  back: { pos: [10, 15, 6], target: [0, 0, 0] },
  top: { pos: [0, 0, 30], target: [0, 0, 0] },
  left: { pos: [-15, 0, 6], target: [0, 0, 0] },
  right: { pos: [15, 0, 6], target: [0, 0, 0] },
};

export type ViewAngle = keyof typeof ANGLES;

export async function viewFrom(args: {
  angle: ViewAngle;
}): Promise<ToolResult<Record<string, never>>> {
  const ctx = getToolContext();
  const a = ANGLES[args.angle];
  ctx.state.scene.camera = { position: a.pos, target: a.target };
  ctx.broadcaster.emit({ type: "sync_state", session: ctx.state.toSession() });
  return ok({});
}

export const viewFromDef = {
  name: "view_from",
  description: "Move camera to a preset angle.",
  schema: {
    type: "object",
    properties: {
      angle: {
        type: "string",
        enum: ["front", "back", "top", "left", "right"],
      },
    },
    required: ["angle"],
  },
  handler: viewFrom,
};
