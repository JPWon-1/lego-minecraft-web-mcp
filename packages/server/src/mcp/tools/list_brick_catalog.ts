import { ok, type ToolResult } from "@blockgame/shared";
import { LEGO_BLOCK_TYPES } from "../catalogs.js";

export interface BrickCatalog {
  standard: string[];
  slopes: string[];
  windows: string[];
  doors: string[];
  special: string[];
}

export async function listBrickCatalog(): Promise<ToolResult<BrickCatalog>> {
  return ok({
    standard: LEGO_BLOCK_TYPES.filter((t) => t.startsWith("brick_")),
    slopes: LEGO_BLOCK_TYPES.filter((t) => t.startsWith("slope_")),
    windows: LEGO_BLOCK_TYPES.filter((t) => t.startsWith("window_")),
    doors: LEGO_BLOCK_TYPES.filter((t) => t.startsWith("door_")),
    special: LEGO_BLOCK_TYPES.filter((t) => t.startsWith("baseplate_")),
  });
}

export const listBrickCatalogDef = {
  name: "list_brick_catalog",
  description: "List all available LEGO brick types grouped by category.",
  schema: { type: "object", properties: {} },
  handler: listBrickCatalog,
};
