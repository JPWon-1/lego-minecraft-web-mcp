import { promises as fs } from "node:fs";
import path from "node:path";
import type { Session } from "@blockgame/shared";
import { GameState } from "./game-state.js";

export async function saveSession(state: GameState, dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${state.id}.json`);
  await fs.writeFile(file, JSON.stringify(state.toSession(), null, 2), "utf8");
}

export async function loadSession(id: string, dir: string): Promise<GameState> {
  const file = path.join(dir, `${id}.json`);
  const raw = await fs.readFile(file, "utf8");
  const session = JSON.parse(raw) as Session;
  const state = new GameState(session.id);
  (state as unknown as { turns: Session["turns"] }).turns.push(...session.turns);
  state.scene = session.current_scene;
  state.challenge_id = session.challenge_id;
  state.hintsUsed = session.hints_used;
  state.finalized = session.finalized;
  (state as unknown as { last_updated_at: number }).last_updated_at = session.last_updated_at;
  return state;
}

export function defaultSessionDir(): string {
  const home = process.env.HOME ?? ".";
  return path.join(home, ".blockgame", "sessions");
}
