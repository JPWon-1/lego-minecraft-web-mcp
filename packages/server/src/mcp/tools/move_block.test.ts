import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { moveBlock } from "./move_block.js";
import { placeBlock } from "./place_block.js";
import { recordUserIntent } from "./record_user_intent.js";

describe("move_block", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("moves existing block to new position", async () => {
    await recordUserIntent({ text: "go" });
    const placed = await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
    });
    if (!placed.ok) throw new Error("setup");
    const r = await moveBlock({
      block_id: placed.data.block_id,
      new_position: [5, 6, 7],
    });
    expect(r.ok).toBe(true);
    expect(state.scene.blocks[0].position).toEqual([5, 6, 7]);
  });

  it("errors on unknown id", async () => {
    await recordUserIntent({ text: "go" });
    const r = await moveBlock({ block_id: "nope", new_position: [1, 1, 1] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_BLOCK_ID");
  });
});
