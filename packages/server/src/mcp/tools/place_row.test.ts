import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { placeRow } from "./place_row.js";

describe("place_row", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("places N blocks along y axis", async () => {
    await recordUserIntent({ text: "row" });
    const r = await placeRow({
      track: "minecraft",
      type: "voxel_1x1",
      color: "#F00",
      start: [2, 0, 0],
      direction: "y",
      count: 4,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.blocks_placed).toBe(4);
    expect(state.scene.blocks).toHaveLength(4);
    expect(state.scene.blocks[0].position).toEqual([2, 0, 0]);
    expect(state.scene.blocks[3].position).toEqual([2, 3, 0]);
  });
});
