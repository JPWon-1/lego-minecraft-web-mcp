import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { viewFrom } from "./view_from.js";

describe("view_from", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("updates camera position to preset", async () => {
    const r = await viewFrom({ angle: "top" });
    expect(r.ok).toBe(true);
    expect(state.scene.camera.position).toEqual([0, 0, 30]);
  });
});
