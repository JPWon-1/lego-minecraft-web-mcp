import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";

describe("record_user_intent tool", () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("creates a new turn and returns turn_id", async () => {
    const r = await recordUserIntent({ text: "build a house" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.turn_id).toMatch(/^t-/);
    expect(state.turns).toHaveLength(1);
    expect(state.turns[0].user_intent).toBe("build a house");
  });

  it("rejects empty text", async () => {
    const r = await recordUserIntent({ text: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INTERNAL");
  });

  it("rejects whitespace-only text", async () => {
    const r = await recordUserIntent({ text: "   " });
    expect(r.ok).toBe(false);
  });
});
