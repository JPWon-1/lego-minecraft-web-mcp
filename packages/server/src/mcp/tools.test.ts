import { describe, it, expect } from "vitest";
import { toolRegistry, registerTool } from "./tools.js";
import { ok } from "@blockgame/shared";

describe("toolRegistry", () => {
  it("starts accessible (size >= 0)", () => {
    expect(toolRegistry.size).toBeGreaterThanOrEqual(0);
  });

  it("registerTool adds a tool", () => {
    const before = toolRegistry.size;
    registerTool({
      name: "test_tool",
      description: "t",
      schema: {},
      handler: async () => ok(1),
    });
    expect(toolRegistry.has("test_tool")).toBe(true);
    expect(toolRegistry.size).toBe(before + 1);
    toolRegistry.delete("test_tool");
  });
});
