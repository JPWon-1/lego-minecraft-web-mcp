import type { Block, Track } from "../types/block.js";
import type { TargetVoxelMap } from "../types/challenge.js";
import type { LoadedChallenge } from "./loader.js";

export function targetToBlocks(target: TargetVoxelMap, track: Track = "minecraft"): Block[] {
  return target.blocks.map((b, i) => ({
    id: `target-${i}`,
    track,
    type: b.type,
    position: b.pos,
    color: b.color,
    placed_at: 0,
    turn_id: "target",
  }));
}

export function loadTargetBlocksFromChallenge(ch: LoadedChallenge, track: Track = "minecraft"): Block[] {
  return targetToBlocks(ch.voxelTarget, track);
}
