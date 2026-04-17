import { ok, type ToolResult } from "@blockgame/shared";
import { COLORS } from "../catalogs.js";

export async function listColors(): Promise<ToolResult<{ colors: string[] }>> {
  return ok({ colors: [...COLORS] });
}

export const listColorsDef = {
  name: "list_colors",
  description: "List available color hex codes.",
  schema: { type: "object", properties: {} },
  handler: listColors,
};
