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
};

export function sizeOf(type: string): [number, number, number] {
  return BRICK_SIZES[type] ?? [1, 1, 1];
}
