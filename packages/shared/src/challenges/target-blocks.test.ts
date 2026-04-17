import { describe, it, expect } from "vitest";
import { targetToBlocks } from "./target-blocks.js";

describe("targetToBlocks", () => {
  it("maps a voxel target to Block[] with synthetic ids", () => {
    const blocks = targetToBlocks({
      grid_size: [5, 5, 5],
      blocks: [
        { pos: [0, 0, 0], color: "#FFF", type: "voxel_1x1" },
        { pos: [1, 0, 0], color: "#F00", type: "voxel_1x1" },
      ],
    });
    expect(blocks).toHaveLength(2);
    expect(blocks[0].id).toBe("target-0");
    expect(blocks[0].track).toBe("minecraft");
  });
});
