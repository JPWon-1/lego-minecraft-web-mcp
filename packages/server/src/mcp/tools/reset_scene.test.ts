import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { placeBlock } from "./place_block.js";
import { resetScene } from "./reset_scene.js";

describe("reset_scene", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("clears all blocks", async () => {
    await recordUserIntent({ text: "go" });
    await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
    });
    await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [1, 0, 0],
      color: "#fff",
    });
    const r = await resetScene();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.cleared).toBe(2);
    expect(state.scene.blocks).toHaveLength(0);
  });
});
