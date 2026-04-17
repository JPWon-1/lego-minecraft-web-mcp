import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "./game-state.js";

describe("GameState", () => {
  let s: GameState;
  beforeEach(() => {
    s = new GameState("sess-1");
  });

  it("starts with empty scene, no turns", () => {
    expect(s.scene.blocks).toHaveLength(0);
    expect(s.turns).toHaveLength(0);
  });

  it("beginTurn creates a new turn with intent", () => {
    const t = s.beginTurn("build house");
    expect(t.turn_id).toMatch(/^t-/);
    expect(t.user_intent).toBe("build house");
    expect(s.currentTurn?.turn_id).toBe(t.turn_id);
  });

  it("addBlock attaches to current turn", () => {
    s.beginTurn("go");
    s.addBlock({
      id: "b1",
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
      placed_at: Date.now(),
      turn_id: s.currentTurn!.turn_id,
    });
    expect(s.scene.blocks).toHaveLength(1);
  });

  it("rejects addBlock with no current turn", () => {
    expect(() =>
      s.addBlock({
        id: "b1",
        track: "minecraft",
        type: "voxel_1x1",
        position: [0, 0, 0],
        color: "#fff",
        placed_at: Date.now(),
        turn_id: "stale",
      }),
    ).toThrow(/intent/i);
  });

  it("hintsUsed increments", () => {
    expect(s.hintsUsed).toBe(0);
    s.incrementHint();
    expect(s.hintsUsed).toBe(1);
  });
});
