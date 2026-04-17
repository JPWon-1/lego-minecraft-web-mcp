import type { ChallengeManifest, Difficulty, ChallengeMode } from "../types/challenge.js";
import type { Track } from "../types/block.js";

const DIFF: Difficulty[] = ["easy", "medium", "hard"];
const MODE: ChallengeMode[] = ["image", "text"];
const TRACKS: Track[] = ["minecraft", "lego"];

export function validateManifest(obj: unknown): ChallengeManifest {
  if (!obj || typeof obj !== "object") {
    throw new Error("manifest: expected object");
  }
  const m = obj as Record<string, unknown>;
  const required = [
    "id", "title", "difficulty", "mode", "grid_size", "tracks",
    "target_image", "target_spec_md", "target_voxels", "target_bricks",
    "hints", "optimal_instructions", "time_estimate_minutes",
  ];
  for (const key of required) {
    if (!(key in m)) throw new Error(`manifest: missing required field "${key}"`);
  }
  if (!DIFF.includes(m.difficulty as Difficulty))
    throw new Error(`manifest: invalid difficulty "${m.difficulty}"`);
  if (!MODE.includes(m.mode as ChallengeMode))
    throw new Error(`manifest: invalid mode "${m.mode}"`);
  if (!Array.isArray(m.tracks) || !m.tracks.every(t => TRACKS.includes(t as Track)))
    throw new Error(`manifest: invalid tracks`);
  if (!Array.isArray(m.grid_size) || m.grid_size.length !== 3)
    throw new Error(`manifest: grid_size must be [x,y,z]`);
  return m as unknown as ChallengeManifest;
}
