import { ok, type ToolResult, type SceneSnapshot } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function getScene(): Promise<ToolResult<SceneSnapshot>> {
  return ok(getToolContext().state.scene);
}

export const getSceneDef = {
  name: "get_scene",
  description: "Return current scene snapshot.",
  schema: { type: "object", properties: {} },
  handler: getScene,
};
