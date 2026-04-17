import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { placeBlock } from "./place_block.js";
import { getScene } from "./get_scene.js";

describe("get_scene", () => {
  beforeEach(() => {
    setToolContext({ state: new GameState("s"), broadcaster: new Broadcaster() });
  });

  it("returns current scene with placed blocks", async () => {
    await recordUserIntent({ text: "go" });
    await placeBlock({
      track: "minecraft",
      type: "voxel_1x1",
      position: [1, 1, 1],
      color: "#fff",
    });
    const r = await getScene();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.blocks).toHaveLength(1);
  });
});
