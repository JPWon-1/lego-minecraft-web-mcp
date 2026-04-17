import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { removeBlock } from "./remove_block.js";
import { placeBlock } from "./place_block.js";
import { recordUserIntent } from "./record_user_intent.js";

describe("remove_block", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("removes existing block", async () => {
    await recordUserIntent({ text: "go" });
    const placed = await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
    });
    if (!placed.ok) throw new Error("setup");
    const r = await removeBlock({ block_id: placed.data.block_id });
    expect(r.ok).toBe(true);
    expect(state.scene.blocks).toHaveLength(0);
  });

  it("errors on unknown id", async () => {
    await recordUserIntent({ text: "go" });
    const r = await removeBlock({ block_id: "nope" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_BLOCK_ID");
  });
});
