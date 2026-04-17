import { toolRegistry } from "./tools.js";

export function listTools(): Array<{ name: string; description: string; schema: unknown }> {
  return Array.from(toolRegistry.values()).map((t) => ({
    name: t.name,
    description: t.description,
    schema: t.schema,
  }));
}

export async function callTool(
  name: string,
  args: unknown,
  ctx: { sessionId: string } = { sessionId: "default" },
) {
  const tool = toolRegistry.get(name);
  if (!tool) throw new Error(`unknown tool ${name}`);
  return tool.handler(args, ctx);
}
