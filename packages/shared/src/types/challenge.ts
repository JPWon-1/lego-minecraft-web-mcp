import type { Track, Vec3 } from "./block.js";

export type Difficulty = "easy" | "medium" | "hard";
export type ChallengeMode = "image" | "text";
export type HintLevel = "small" | "medium" | "large";

export interface Hint {
  level: HintLevel;
  penalty: number;
  text: string;
}

export interface ChallengeManifest {
  id: string;
  title: string;
  difficulty: Difficulty;
  mode: ChallengeMode;
  grid_size: Vec3;
  tracks: Track[];
  target_image: string;
  target_spec_md: string;
  target_voxels: string;
  target_bricks: string;
  hints: Hint[];
  optimal_instructions: number;
  time_estimate_minutes: number;
  tutorial_mode?: boolean;
}

export interface TargetVoxelMap {
  grid_size: Vec3;
  blocks: { pos: Vec3; color: string; type: string }[];
}
