import { registerTool, type ToolDef } from "./tools.js";
import { recordUserIntentDef } from "./tools/record_user_intent.js";
import { placeBlockDef } from "./tools/place_block.js";
import { removeBlockDef } from "./tools/remove_block.js";
import { moveBlockDef } from "./tools/move_block.js";
import { placeWallDef } from "./tools/place_wall.js";
import { placeRowDef } from "./tools/place_row.js";
import { resetSceneDef } from "./tools/reset_scene.js";
import { undoDef } from "./tools/undo.js";
import { listColorsDef } from "./tools/list_colors.js";
import { listBlockTypesDef } from "./tools/list_block_types.js";
import { getSceneDef } from "./tools/get_scene.js";
import { viewFromDef } from "./tools/view_from.js";
import { paintBlockDef } from "./tools/paint_block.js";
import { fillRegionDef } from "./tools/fill_region.js";
import { listBrickCatalogDef } from "./tools/list_brick_catalog.js";
import { stackBricksDef } from "./tools/stack_bricks.js";
import { getTargetHintDef } from "./tools/get_target_hint.js";
import { submitSolutionDef } from "./tools/submit_solution.js";

export function registerAllTools(): void {
  const defs = [
    recordUserIntentDef,
    placeBlockDef,
    removeBlockDef,
    moveBlockDef,
    placeWallDef,
    placeRowDef,
    resetSceneDef,
    undoDef,
    listColorsDef,
    listBlockTypesDef,
    getSceneDef,
    viewFromDef,
    paintBlockDef,
    fillRegionDef,
    listBrickCatalogDef,
    stackBricksDef,
    getTargetHintDef,
    submitSolutionDef,
  ];
  for (const def of defs) {
    registerTool(def as unknown as ToolDef);
  }
}
