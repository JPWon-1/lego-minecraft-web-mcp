import type { Block } from "../types/block.js";

function positionKey(pos: readonly [number, number, number]): string {
  return `${pos[0]},${pos[1]},${pos[2]}`;
}

function toVoxelMap(blocks: Block[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of blocks) {
    map.set(positionKey(b.position), b.color.toLowerCase());
  }
  return map;
}

export function computeVoxelIoU(result: Block[], target: Block[]): number {
  const R = toVoxelMap(result);
  const T = toVoxelMap(target);
  const keys = new Set<string>([...R.keys(), ...T.keys()]);
  if (keys.size === 0) return 0;

  let intersection = 0;
  let union = 0;
  for (const k of keys) {
    const r = R.get(k);
    const t = T.get(k);
    if (r !== undefined && t !== undefined && r === t) intersection++;
    if (r !== undefined || t !== undefined) union++;
  }
  return intersection / union;
}
