import { describe, it, expect } from "vitest";
import { listColors } from "./list_colors.js";

describe("list_colors", () => {
  it("returns the color catalog", async () => {
    const r = await listColors();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.colors.length).toBeGreaterThan(0);
      expect(r.data.colors[0]).toMatch(/^#/);
    }
  });
});
