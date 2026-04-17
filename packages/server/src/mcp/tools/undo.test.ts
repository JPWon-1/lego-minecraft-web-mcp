import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { placeBlock } from "./place_block.js";
import { undo } from "./undo.js";

describe("undo", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("removes the last placed block", async () => {
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
    const r = await undo();
    expect(r.ok).toBe(true);
    expect(state.scene.blocks).toHaveLength(1);
    expect(state.scene.blocks[0].position).toEqual([0, 0, 0]);
  });

  it("errors when there is nothing to undo", async () => {
    await recordUserIntent({ text: "go" });
    const r = await undo();
    expect(r.ok).toBe(false);
  });
});
