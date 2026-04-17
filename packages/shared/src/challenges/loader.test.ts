import { describe, it, expect } from "vitest";
import { loadChallenge } from "./loader.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OK = path.join(__dirname, "__fixtures__/ok");
const BAD = path.join(__dirname, "__fixtures__/bad");

describe("loadChallenge", () => {
  it("loads manifest and voxel target", async () => {
    const c = await loadChallenge(OK);
    expect(c.manifest.id).toBe("ch-test");
    expect(c.voxelTarget.blocks).toHaveLength(1);
  });
  it("throws on malformed manifest", async () => {
    await expect(loadChallenge(BAD)).rejects.toThrow(/missing/i);
  });
});
