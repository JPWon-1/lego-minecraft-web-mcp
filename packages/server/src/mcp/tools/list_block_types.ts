import { ok, err, type ToolResult, type Track } from "@blockgame/shared";
import { MINECRAFT_BLOCK_TYPES, LEGO_BLOCK_TYPES } from "../catalogs.js";

export async function listBlockTypes(args: {
  track: Track;
}): Promise<ToolResult<{ types: string[] }>> {
  if (args.track === "minecraft") {
    return ok({ types: [...MINECRAFT_BLOCK_TYPES] });
  }
  if (args.track === "lego") {
    return ok({ types: [...LEGO_BLOCK_TYPES] });
  }
  return err("INTERNAL", `unknown track ${args.track}`);
}

export const listBlockTypesDef = {
  name: "list_block_types",
  description: "List available block/brick types for the given track.",
  schema: {
    type: "object",
    properties: { track: { type: "string", enum: ["minecraft", "lego"] } },
    required: ["track"],
  },
  handler: listBlockTypes,
};
