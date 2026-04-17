import type { SceneSnapshot } from "./block.js";

export interface ToolCallLog {
  timestamp: number;
  turn_id: string;
  user_intent: string;
  tool_name: string;
  args: Record<string, unknown>;
  result_summary: string;
}

export interface Turn {
  turn_id: string;
  user_intent: string;
  started_at: number;
  tool_calls: ToolCallLog[];
}

export interface Session {
  id: string;
  challenge_id?: string;
  created_at: number;
  last_updated_at: number;
  turns: Turn[];
  current_scene: SceneSnapshot;
  hints_used: number;
  finalized: boolean;
}
