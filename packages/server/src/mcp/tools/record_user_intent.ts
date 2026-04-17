import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export interface RecordIntentArgs {
  text: string;
  turn_id?: string;
}

export interface RecordIntentData {
  turn_id: string;
}

export async function recordUserIntent(
  args: RecordIntentArgs,
): Promise<ToolResult<RecordIntentData>> {
  if (!args.text || args.text.trim().length === 0) {
    return err("INTERNAL", "text must be a non-empty string");
  }
  const { state } = getToolContext();
  const turn = state.beginTurn(args.text);
  return ok({ turn_id: turn.turn_id });
}

export const recordUserIntentDef = {
  name: "record_user_intent",
  description:
    "MUST be called first at the start of every user instruction. Pass the user's original message verbatim. Build tools called before this in a new turn will be rejected.",
  schema: {
    type: "object",
    properties: {
      text: { type: "string", description: "original user message" },
      turn_id: { type: "string", description: "optional client-side turn id" },
    },
    required: ["text"],
  },
  handler: recordUserIntent,
};
