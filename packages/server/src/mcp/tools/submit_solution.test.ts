import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { submitSolution } from "./submit_solution.js";
import { buildReport } from "../../scoring/report-builder.js";
import { analyzeAmbiguity } from "../../scoring/ambiguity-analyzer.js";

describe("submit_solution", () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState("sess-x");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("errors with CHALLENGE_NOT_FOUND when challenge id is unmapped", async () => {
    state.challenge_id = "ch-nonexistent";
    const r = await submitSolution({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("CHALLENGE_NOT_FOUND");
  });

  it("buildReport produces a well-formed report from mock data", async () => {
    const ambiguity = await analyzeAmbiguity([]);
    const report = buildReport({
      challenge_id: "ch-001",
      session_id: "sess-x",
      turns: [],
      iou: 0.75,
      hintsUsed: 1,
      batchToolUses: 0,
      startedAt: 0,
      submittedAt: 1000,
      ambiguity,
    });
    expect(report.challenge_id).toBe("ch-001");
    expect(report.session_id).toBe("sess-x");
    expect(report.turn_count).toBe(0);
    expect(report.total_time_seconds).toBe(1);
    expect(report.breakdown.voxel_iou).toBe(0.75);
    expect(report.breakdown.iou_points).toBe(75);
    expect(typeof report.breakdown.final).toBe("number");
    expect(report.breakdown.grade).toMatch(/^[SABCD]$/);
    expect(report.good.title).toBeTruthy();
    expect(report.llm_analysis_available).toBe(false);
  });
});
