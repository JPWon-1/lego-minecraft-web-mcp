import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { getTargetHint } from "./get_target_hint.js";

describe("get_target_hint", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    state.challenge_id = "ch-test";
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("returns the small hint and increments counter", async () => {
    const r = await getTargetHint({ level: "small" });
    expect(r.ok).toBe(true);
    expect(state.hintsUsed).toBe(1);
    if (r.ok) {
      expect(r.data.penalty).toBe(5);
      expect(r.data.remaining).toBe(2);
    }
  });

  it("errors on 4th hint", async () => {
    await getTargetHint({ level: "small" });
    await getTargetHint({ level: "medium" });
    await getTargetHint({ level: "large" });
    const r = await getTargetHint({ level: "small" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("HINT_LIMIT_EXCEEDED");
  });
});
