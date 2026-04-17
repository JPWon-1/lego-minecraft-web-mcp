import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { placeWall } from "./place_wall.js";

describe("place_wall", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("places a rectangular wall along X axis", async () => {
    await recordUserIntent({ text: "wall" });
    const r = await placeWall({
      track: "minecraft",
      type: "voxel_1x1",
      color: "#FFF",
      start: [0, 0, 0],
      end: [4, 0, 0],
      height: 3,
    });
    expect(r.ok).toBe(true);
    // 5 blocks along X, 3 high = 15
    if (r.ok) expect(r.data.blocks_placed).toBe(15);
    expect(state.scene.blocks).toHaveLength(15);
  });
});
