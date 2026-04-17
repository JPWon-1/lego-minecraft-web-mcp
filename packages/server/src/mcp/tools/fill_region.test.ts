import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { fillRegion } from "./fill_region.js";

describe("fill_region", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("fills a 2x2x2 box with 8 blocks", async () => {
    await recordUserIntent({ text: "fill" });
    const r = await fillRegion({
      box: [
        [0, 0, 0],
        [1, 1, 1],
      ],
      color: "#00FF00",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.blocks_placed).toBe(8);
    expect(state.scene.blocks).toHaveLength(8);
  });
});
