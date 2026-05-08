import type { Block, Rotation } from "@blockgame/shared";

export const BRICK_SIZES: Record<string, [number, number, number]> = {
  voxel_1x1: [1, 1, 1],
  brick_1x1: [1, 1, 1],
  brick_1x2: [1, 2, 1],
  brick_2x2: [2, 2, 1],
  brick_2x4: [2, 4, 1],
  brick_1x8: [1, 8, 1],
  slope_1x2: [1, 2, 1],
  slope_2x2: [2, 2, 1],
  window_1x2: [1, 2, 1],
  window_2x2: [2, 2, 1],
  door_1x3: [1, 1, 3],
  baseplate_16x16: [16, 16, 0.25],
};

/** Apply Y-axis rotation to a footprint: at 90° / 270° the X and Y dims swap. */
export function rotatedSize(
  type: string,
  rotation: Rotation = 0,
): [number, number, number] {
  const [sx, sy, sz] = BRICK_SIZES[type] ?? [1, 1, 1];
  if (rotation === 90 || rotation === 270) return [sy, sx, sz];
  return [sx, sy, sz];
}

export function aabbOf(b: {
  type: string;
  position: [number, number, number];
  rotation?: Rotation;
}): [number, number, number, number, number, number] {
  const [sx, sy, sz] = rotatedSize(b.type, b.rotation ?? 0);
  const [x, y, z] = b.position;
  return [x - sx / 2, x + sx / 2, y - sy / 2, y + sy / 2, z - sz / 2, z + sz / 2];
}

export function aabbOverlap(
  a: [number, number, number, number, number, number],
  b: [number, number, number, number, number, number],
): boolean {
  const eps = 1e-6;
  return (
    a[0] + eps < b[1] &&
    a[1] > b[0] + eps &&
    a[2] + eps < b[3] &&
    a[3] > b[2] + eps &&
    a[4] + eps < b[5] &&
    a[5] > b[4] + eps
  );
}

export function findOverlap(
  candidate: {
    type: string;
    position: [number, number, number];
    rotation?: Rotation;
  },
  existing: Block[],
): Block | null {
  const a = aabbOf(candidate);
  for (const b of existing) {
    if (aabbOverlap(a, aabbOf(b))) return b;
  }
  return null;
}

/** Does footprint A's XY rectangle overlap footprint B's XY rectangle? */
function xyOverlap(
  ax0: number, ax1: number, ay0: number, ay1: number,
  bx0: number, bx1: number, by0: number, by1: number,
): boolean {
  const eps = 1e-6;
  return ax0 + eps < bx1 && ax1 > bx0 + eps && ay0 + eps < by1 && ay1 > by0 + eps;
}

/** Are two XY rectangles edge-adjacent (share a face along x or y)? Used for
 * "lean on neighbor" support — the brick rests partly on a same-Z neighbor
 * which itself is supported (e.g., gable roof inner cells). */
function xyAdjacent(
  ax0: number, ax1: number, ay0: number, ay1: number,
  bx0: number, bx1: number, by0: number, by1: number,
): boolean {
  const eps = 1e-6;
  // Edges touch on x: a's right == b's left or vice versa, AND y ranges overlap
  const xTouch =
    Math.abs(ax1 - bx0) < eps || Math.abs(bx1 - ax0) < eps;
  const yOverlap = ay0 + eps < by1 && ay1 > by0 + eps;
  if (xTouch && yOverlap) return true;
  const yTouch =
    Math.abs(ay1 - by0) < eps || Math.abs(by1 - ay0) < eps;
  const xOverlap = ax0 + eps < bx1 && ax1 > bx0 + eps;
  return yTouch && xOverlap;
}

/** Check whether a LEGO brick at the candidate position is physically
 * supported. Returns true if z-bottom rests on baseplate, on a block below
 * with overlapping footprint, or on a same-Z neighbor (lean support).
 *
 * Minecraft is intentionally exempt — you can hang a dirt block in mid-air. */
export function isSupported(
  candidate: {
    type: string;
    position: [number, number, number];
    rotation?: Rotation;
  },
  existing: Block[],
): boolean {
  const [sx, sy, sz] = rotatedSize(candidate.type, candidate.rotation ?? 0);
  const [x, y, z] = candidate.position;
  const eps = 1e-6;
  const bottomZ = z - sz / 2;
  // Baseplate / ground supports anything sitting at z-bottom 0.
  if (bottomZ <= 0 + eps) return true;
  const ax0 = x - sx / 2, ax1 = x + sx / 2;
  const ay0 = y - sy / 2, ay1 = y + sy / 2;
  // Pass 1: directly underneath?
  for (const b of existing) {
    const [bsx, bsy, bsz] = rotatedSize(b.type, b.rotation ?? 0);
    const [bx, by, bz] = b.position;
    const bTop = bz + bsz / 2;
    if (Math.abs(bTop - bottomZ) > eps) continue;
    const bx0 = bx - bsx / 2, bx1 = bx + bsx / 2;
    const by0 = by - bsy / 2, by1 = by + bsy / 2;
    if (xyOverlap(ax0, ax1, ay0, ay1, bx0, bx1, by0, by1)) return true;
  }
  // Pass 2: same-Z neighbor (lean support).
  for (const b of existing) {
    const [bsx, bsy, bsz] = rotatedSize(b.type, b.rotation ?? 0);
    const [bx, by, bz] = b.position;
    const bBottom = bz - bsz / 2;
    if (Math.abs(bBottom - bottomZ) > eps) continue;
    const bx0 = bx - bsx / 2, bx1 = bx + bsx / 2;
    const by0 = by - bsy / 2, by1 = by + bsy / 2;
    if (xyAdjacent(ax0, ax1, ay0, ay1, bx0, bx1, by0, by1)) return true;
  }
  return false;
}
