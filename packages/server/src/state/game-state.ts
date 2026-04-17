import type { Block, SceneSnapshot, Session, Turn, ToolCallLog } from "@blockgame/shared";
import { newTurnId } from "./turn.js";

const TURN_WINDOW_MS = 30_000;

export class GameState {
  readonly id: string;
  readonly turns: Turn[] = [];
  scene: SceneSnapshot = {
    blocks: [],
    camera: { position: [10, 10, 10], target: [0, 0, 0] },
    taken_at: Date.now(),
  };
  challenge_id?: string;
  hintsUsed = 0;
  finalized = false;
  readonly created_at = Date.now();
  last_updated_at = Date.now();

  constructor(id: string) {
    this.id = id;
  }

  get currentTurn(): Turn | undefined {
    const t = this.turns[this.turns.length - 1];
    if (!t) return undefined;
    if (Date.now() - t.started_at > TURN_WINDOW_MS) return undefined;
    return t;
  }

  beginTurn(userIntent: string): Turn {
    const t: Turn = {
      turn_id: newTurnId(),
      user_intent: userIntent,
      started_at: Date.now(),
      tool_calls: [],
    };
    this.turns.push(t);
    this.last_updated_at = Date.now();
    return t;
  }

  requireCurrentTurn(): Turn {
    const t = this.currentTurn;
    if (!t) throw new Error("INTENT_NOT_LOGGED: call record_user_intent first");
    return t;
  }

  logToolCall(log: Omit<ToolCallLog, "timestamp">): void {
    const t = this.requireCurrentTurn();
    t.tool_calls.push({ ...log, timestamp: Date.now() });
    this.last_updated_at = Date.now();
  }

  addBlock(b: Block): void {
    const t = this.requireCurrentTurn();
    if (b.turn_id !== t.turn_id) {
      b.turn_id = t.turn_id;
    }
    this.scene.blocks.push(b);
    this.last_updated_at = Date.now();
  }

  removeBlock(id: string): Block | undefined {
    this.requireCurrentTurn();
    const idx = this.scene.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return undefined;
    const [removed] = this.scene.blocks.splice(idx, 1);
    this.last_updated_at = Date.now();
    return removed;
  }

  reset(): void {
    this.scene.blocks = [];
    this.last_updated_at = Date.now();
  }

  incrementHint(): void {
    this.hintsUsed++;
    this.last_updated_at = Date.now();
  }

  toSession(): Session {
    return {
      id: this.id,
      challenge_id: this.challenge_id,
      created_at: this.created_at,
      last_updated_at: this.last_updated_at,
      turns: this.turns,
      current_scene: this.scene,
      hints_used: this.hintsUsed,
      finalized: this.finalized,
    };
  }
}
