import type { ScoreReport, Turn, ScoreBreakdown } from "@blockgame/shared";
import { computeFinalScore } from "@blockgame/shared";
import type { AmbiguityAnalysis } from "./ambiguity-analyzer.js";

export interface BuildReportInput {
  challenge_id: string;
  session_id: string;
  turns: Turn[];
  iou: number;
  hintsUsed: number;
  batchToolUses: number;
  startedAt: number;
  submittedAt: number;
  ambiguity: AmbiguityAnalysis;
}

export function buildReport(i: BuildReportInput): ScoreReport {
  const breakdown: ScoreBreakdown = computeFinalScore({
    iou: i.iou,
    turnCount: i.turns.length,
    batchToolUses: i.batchToolUses,
    hintsUsed: i.hintsUsed,
    ambiguityAvg: i.ambiguity.average_score,
  });
  return {
    challenge_id: i.challenge_id,
    session_id: i.session_id,
    submitted_at: i.submittedAt,
    total_time_seconds: Math.round((i.submittedAt - i.startedAt) / 1000),
    turn_count: i.turns.length,
    breakdown,
    good: { title: "잘한 점", items: i.ambiguity.positive },
    bad: { title: "개선점", items: i.ambiguity.negative },
    unnecessary: { title: "불필요", items: i.ambiguity.wasted },
    missing: { title: "놓친 것", items: i.ambiguity.missing },
    recommendations: { title: "다음엔", items: [] },
    llm_analysis_available: i.ambiguity.llm_available,
  };
}
