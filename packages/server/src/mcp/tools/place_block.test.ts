import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { placeBlock } from "./place_block.js";
import { recordUserIntent } from "./record_user_intent.js";

describe("place_block", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("rejects without intent", async () => {
    const r = await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INTENT_NOT_LOGGED");
  });

  it("places a block after intent", async () => {
    await recordUserIntent({ text: "go" });
    const r = await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [1, 2, 3],
      color: "#FF0",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.block_id).toBeTruthy();
    expect(state.scene.blocks).toHaveLength(1);
    expect(state.scene.blocks[0].position).toEqual([1, 2, 3]);
  });

  it("logs a tool call entry on placement", async () => {
    await recordUserIntent({ text: "go" });
    await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
    });
    expect(state.turns[0].tool_calls).toHaveLength(1);
    expect(state.turns[0].tool_calls[0].tool_name).toBe("place_block");
  });
});
