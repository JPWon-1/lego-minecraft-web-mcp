import type { ToolResult } from "@blockgame/shared";

export interface ToolContext {
  sessionId: string;
}

export interface ToolDef<Args = unknown, Data = unknown> {
  name: string;
  description: string;
  schema: unknown;
  handler: (args: Args, ctx: ToolContext) => Promise<ToolResult<Data>>;
}

export const toolRegistry = new Map<string, ToolDef>();

export function registerTool<A, D>(def: ToolDef<A, D>): void {
  toolRegistry.set(def.name, def as unknown as ToolDef);
}
