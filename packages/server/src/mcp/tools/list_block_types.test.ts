import { describe, it, expect } from "vitest";
import { listBlockTypes } from "./list_block_types.js";

describe("list_block_types", () => {
  it("returns minecraft types", async () => {
    const r = await listBlockTypes({ track: "minecraft" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.types).toContain("voxel_1x1");
  });

  it("returns lego types", async () => {
    const r = await listBlockTypes({ track: "lego" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.types).toContain("brick_2x4");
  });
});
