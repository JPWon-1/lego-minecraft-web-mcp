import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { stackBricks } from "./stack_bricks.js";

describe("stack_bricks", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("stacks bricks vertically at base position", async () => {
    await recordUserIntent({ text: "stack" });
    const r = await stackBricks({
      base: [0, 0, 0],
      sequence: [
        { type: "brick_2x2", color: "#FF0000" },
        { type: "brick_2x2", color: "#00FF00" },
        { type: "brick_2x2", color: "#0000FF" },
      ],
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.blocks_placed).toBe(3);
    expect(state.scene.blocks).toHaveLength(3);
    expect(state.scene.blocks[0].position).toEqual([0, 0, 0]);
    expect(state.scene.blocks[2].position).toEqual([0, 0, 2]);
  });
});
