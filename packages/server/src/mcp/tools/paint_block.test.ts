import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { placeBlock } from "./place_block.js";
import { paintBlock } from "./paint_block.js";

describe("paint_block", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("changes color of an existing block", async () => {
    await recordUserIntent({ text: "go" });
    const placed = await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
    });
    if (!placed.ok) throw new Error("setup");
    const r = await paintBlock({
      block_id: placed.data.block_id,
      new_color: "#FF0000",
    });
    expect(r.ok).toBe(true);
    expect(state.scene.blocks[0].color).toBe("#FF0000");
  });
});
