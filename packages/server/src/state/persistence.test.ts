import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { GameState } from "./game-state.js";
import { saveSession, loadSession } from "./persistence.js";

describe("persistence", () => {
  const tmp = path.join(os.tmpdir(), `blockgame-test-${Date.now()}`);

  it("round-trips a session", async () => {
    const s = new GameState("sess-42");
    s.beginTurn("a");
    s.addBlock({
      id: "b1",
      track: "minecraft",
      type: "voxel_1x1",
      position: [0, 0, 0],
      color: "#fff",
      placed_at: Date.now(),
      turn_id: s.currentTurn!.turn_id,
    });
    await saveSession(s, tmp);
    const file = path.join(tmp, "sess-42.json");
    await fs.access(file);
    const loaded = await loadSession("sess-42", tmp);
    expect(loaded.id).toBe("sess-42");
    expect(loaded.scene.blocks).toHaveLength(1);
    expect(loaded.turns).toHaveLength(1);
  });
});
