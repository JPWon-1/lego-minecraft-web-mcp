import { efficiencyBonus } from "./bonus.js";
import { hintPenalty, ambiguityPenalty } from "./penalty.js";
import type { ScoreBreakdown } from "../types/score.js";

export interface FinalScoreInput {
  iou: number;
  turnCount: number;
  batchToolUses: number;
  hintsUsed: number;
  ambiguityAvg: number;
}

export function computeFinalScore(input: FinalScoreInput): ScoreBreakdown {
  const iou_points = Math.round(input.iou * 100);
  const bonus = efficiencyBonus({
    turnCount: input.turnCount,
    batchToolUses: input.batchToolUses,
  });
  const hp = hintPenalty(input.hintsUsed);
  const ap = ambiguityPenalty(input.ambiguityAvg);
  const raw = iou_points + bonus - ap - hp;
  const final = Math.max(0, Math.min(115, raw));
  return {
    voxel_iou: input.iou,
    iou_points,
    efficiency_bonus: bonus,
    ambiguity_penalty: ap,
    hint_penalty: hp,
    final,
    grade: gradeFor(final),
  };
}

export function gradeFor(score: number): ScoreBreakdown["grade"] {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 40) return "C";
  return "D";
}
