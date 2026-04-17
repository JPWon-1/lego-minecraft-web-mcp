import {
  ok,
  err,
  type ToolResult,
  type Block,
  type ScoreReport,
} from "@blockgame/shared";
import { computeVoxelIoU } from "@blockgame/shared";
import { loadChallenge, targetToBlocks } from "@blockgame/shared";
import path from "node:path";
import { getToolContext } from "../tool-context.js";
import { analyzeAmbiguity } from "../../scoring/ambiguity-analyzer.js";
import { buildReport } from "../../scoring/report-builder.js";

const CHALLENGE_ID_TO_SLUG: Record<string, string> = {
  "ch-001": "001-small-cabin",
  "ch-002": "002-grey-shed",
  "ch-003": "003-two-story",
  "ch-004": "004-tower",
  "ch-005": "005-l-shaped-villa",
};

function challengeDir(challenge_id: string): string {
  const slug = CHALLENGE_ID_TO_SLUG[challenge_id];
  if (!slug) throw new Error(`no directory mapped for ${challenge_id}`);
  return path.resolve(process.cwd(), "challenges", slug);
}

// Exported so tests (or a future challenge-integration task) can mock or
// replace the target loader.
export async function loadTargetBlocks(challenge_id: string): Promise<Block[]> {
  const ch = await loadChallenge(challengeDir(challenge_id));
  return targetToBlocks(ch.voxelTarget);
}

export interface SubmitSolutionArgs {
  note?: string;
}

export async function submitSolution(
  _args: SubmitSolutionArgs,
): Promise<ToolResult<ScoreReport>> {
  const ctx = getToolContext();
  const challenge_id = ctx.state.challenge_id ?? "unknown";
  let target: Block[];
  try {
    target = await loadTargetBlocks(challenge_id);
  } catch (e) {
    // For MVP, if challenge isn't found/packaged yet, compute IoU against
    // empty target (0 or 1 depending on scene emptiness).
    const msg = e instanceof Error ? e.message : String(e);
    if (!CHALLENGE_ID_TO_SLUG[challenge_id]) {
      return err(
        "CHALLENGE_NOT_FOUND",
        `No challenge mapped for id ${challenge_id}`,
        msg,
      );
    }
    target = [];
  }
  const iou = computeVoxelIoU(ctx.state.scene.blocks, target);
  const ambiguity = await analyzeAmbiguity(ctx.state.turns);
  const batchCount = ctx.state.turns
    .flatMap((t) => t.tool_calls)
    .filter(
      (c) => c.tool_name === "place_wall" || c.tool_name === "place_row",
    ).length;
  const report = buildReport({
    challenge_id,
    session_id: ctx.state.id,
    turns: ctx.state.turns,
    iou,
    hintsUsed: ctx.state.hintsUsed,
    batchToolUses: batchCount,
    startedAt: ctx.state.turns[0]?.started_at ?? Date.now(),
    submittedAt: Date.now(),
    ambiguity,
  });
  ctx.state.finalized = true;
  ctx.broadcaster.emit({ type: "score_result", report });
  return ok(report);
}

export const submitSolutionDef = {
  name: "submit_solution",
  description:
    "Finalize the session. Computes IoU, ambiguity, builds the score report.",
  schema: {
    type: "object",
    properties: { note: { type: "string" } },
  },
  handler: submitSolution,
};
