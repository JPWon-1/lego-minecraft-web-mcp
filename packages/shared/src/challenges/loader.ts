import { promises as fs } from "node:fs";
import path from "node:path";
import { validateManifest } from "./validate.js";
import type { ChallengeManifest, TargetVoxelMap } from "../types/challenge.js";

export interface LoadedChallenge {
  dir: string;
  manifest: ChallengeManifest;
  voxelTarget: TargetVoxelMap;
}

export async function loadChallenge(dir: string): Promise<LoadedChallenge> {
  const manifestPath = path.join(dir, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = validateManifest(JSON.parse(raw));
  const voxelPath = path.join(dir, manifest.target_voxels);
  const voxelRaw = await fs.readFile(voxelPath, "utf8");
  const voxelTarget = JSON.parse(voxelRaw) as TargetVoxelMap;
  return { dir, manifest, voxelTarget };
}
