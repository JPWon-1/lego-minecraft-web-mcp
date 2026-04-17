import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

const HINT_LIMIT = 3;

export type HintLevel = "small" | "medium" | "large";

export interface GetTargetHintArgs {
  level: HintLevel;
}

export interface GetTargetHintData {
  text: string;
  penalty: number;
  remaining: number;
}

export async function getTargetHint(
  args: GetTargetHintArgs,
): Promise<ToolResult<GetTargetHintData>> {
  const ctx = getToolContext();
  if (ctx.state.hintsUsed >= HINT_LIMIT) {
    return err("HINT_LIMIT_EXCEEDED", "No hints remaining");
  }
  ctx.state.incrementHint();
  // MVP stub — production loads manifest.hints and returns real text.
  const penalty =
    args.level === "small" ? 5 : args.level === "medium" ? 10 : 20;
  const text = `(stub ${args.level} hint)`;
  const remaining = HINT_LIMIT - ctx.state.hintsUsed;
  return ok({ text, penalty, remaining });
}

export const getTargetHintDef = {
  name: "get_target_hint",
  description:
    "Request a hint about the target. Limited to 3 per session. Penalty applied.",
  schema: {
    type: "object",
    properties: {
      level: { type: "string", enum: ["small", "medium", "large"] },
    },
    required: ["level"],
  },
  handler: getTargetHint,
};
