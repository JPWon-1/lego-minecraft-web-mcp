import type { Track } from "@blockgame/shared";

export interface ModulePart {
  offset: [number, number, number];
  type: string;
  color: string;
}

export type ModuleCategory = "window" | "door" | "roof" | "structural" | "nature";

export interface BuildModule {
  id: string;
  name: string;
  ko: string;
  track: Track;
  category: ModuleCategory;
  /** bounding box in brick units, for preview sizing [x, y, z] */
  size: [number, number, number];
  parts: ModulePart[];
  /** primary swatch color used in palette thumbnail accent */
  accent: string;
}

const W = "#F5F4EF";
const R = "#E4202B";
const B = "#006CB7";
const Y = "#FFCD00";
const K = "#9AA0A5";
const G = "#00852B";
const BR = "#8B4513";

export const MODULES: BuildModule[] = [
  // ── LEGO ─────────────────────────────────────────────────────
  {
    id: "lego_window_3x3",
    name: "Window 3×3",
    ko: "창문 3×3",
    track: "lego",
    category: "window",
    size: [3, 1, 3],
    accent: B,
    parts: [
      { offset: [0, 0, 0], type: "brick_1x1", color: W },
      { offset: [2, 0, 0], type: "brick_1x1", color: W },
      { offset: [0, 0, 1], type: "brick_1x1", color: W },
      { offset: [1, 0, 1], type: "brick_1x1", color: B },
      { offset: [2, 0, 1], type: "brick_1x1", color: W },
      { offset: [0, 0, 2], type: "brick_1x1", color: W },
      { offset: [2, 0, 2], type: "brick_1x1", color: W },
    ],
  },
  {
    id: "lego_door_3x3",
    name: "Doorway 3×3",
    ko: "문 3×3",
    track: "lego",
    category: "door",
    size: [3, 1, 3],
    accent: Y,
    parts: [
      { offset: [0, 0, 0], type: "brick_1x1", color: W },
      { offset: [1, 0, 0], type: "brick_1x1", color: Y },
      { offset: [2, 0, 0], type: "brick_1x1", color: W },
      { offset: [0, 0, 1], type: "brick_1x1", color: W },
      { offset: [1, 0, 1], type: "brick_1x1", color: Y },
      { offset: [2, 0, 1], type: "brick_1x1", color: W },
      { offset: [0, 0, 2], type: "brick_1x1", color: W },
      { offset: [1, 0, 2], type: "brick_1x1", color: W },
      { offset: [2, 0, 2], type: "brick_1x1", color: W },
    ],
  },
  {
    id: "lego_roof_5x3",
    name: "Pitched roof 5×3",
    ko: "삼각 지붕 5×3",
    track: "lego",
    category: "roof",
    size: [5, 1, 3],
    accent: R,
    parts: [
      { offset: [0, 0, 0], type: "brick_1x1", color: R },
      { offset: [1, 0, 0], type: "brick_1x1", color: R },
      { offset: [2, 0, 0], type: "brick_1x1", color: R },
      { offset: [3, 0, 0], type: "brick_1x1", color: R },
      { offset: [4, 0, 0], type: "brick_1x1", color: R },
      { offset: [1, 0, 1], type: "brick_1x1", color: R },
      { offset: [2, 0, 1], type: "brick_1x1", color: R },
      { offset: [3, 0, 1], type: "brick_1x1", color: R },
      { offset: [2, 0, 2], type: "brick_1x1", color: R },
    ],
  },
  {
    id: "lego_column_1x5",
    name: "Column ×5",
    ko: "기둥 ×5",
    track: "lego",
    category: "structural",
    size: [1, 1, 5],
    accent: K,
    parts: [
      { offset: [0, 0, 0], type: "brick_1x1", color: K },
      { offset: [0, 0, 1], type: "brick_1x1", color: K },
      { offset: [0, 0, 2], type: "brick_1x1", color: K },
      { offset: [0, 0, 3], type: "brick_1x1", color: K },
      { offset: [0, 0, 4], type: "brick_1x1", color: K },
    ],
  },
  {
    id: "lego_chimney",
    name: "Chimney ×4",
    ko: "굴뚝 ×4",
    track: "lego",
    category: "structural",
    size: [1, 1, 4],
    accent: K,
    parts: [
      { offset: [0, 0, 0], type: "brick_1x1", color: K },
      { offset: [0, 0, 1], type: "brick_1x1", color: K },
      { offset: [0, 0, 2], type: "brick_1x1", color: K },
      { offset: [0, 0, 3], type: "brick_1x1", color: R },
    ],
  },
  {
    id: "lego_stair_1x4",
    name: "Stair ×4",
    ko: "계단 ×4",
    track: "lego",
    category: "structural",
    size: [4, 1, 4],
    accent: Y,
    parts: [
      { offset: [0, 0, 0], type: "brick_1x1", color: Y },
      { offset: [1, 0, 1], type: "brick_1x1", color: Y },
      { offset: [2, 0, 2], type: "brick_1x1", color: Y },
      { offset: [3, 0, 3], type: "brick_1x1", color: Y },
    ],
  },

  // ── Minecraft ─────────────────────────────────────────────────
  {
    id: "mc_tree",
    name: "Tree",
    ko: "나무",
    track: "minecraft",
    category: "nature",
    size: [3, 3, 5],
    accent: G,
    parts: [
      { offset: [1, 1, 0], type: "voxel_1x1", color: BR },
      { offset: [1, 1, 1], type: "voxel_1x1", color: BR },
      { offset: [1, 1, 2], type: "voxel_1x1", color: BR },
      { offset: [1, 1, 3], type: "voxel_1x1", color: G },
      { offset: [0, 1, 3], type: "voxel_1x1", color: G },
      { offset: [2, 1, 3], type: "voxel_1x1", color: G },
      { offset: [1, 0, 3], type: "voxel_1x1", color: G },
      { offset: [1, 2, 3], type: "voxel_1x1", color: G },
      { offset: [1, 1, 4], type: "voxel_1x1", color: G },
    ],
  },
  {
    id: "mc_grass_patch",
    name: "Grass 3×3",
    ko: "잔디 3×3",
    track: "minecraft",
    category: "nature",
    size: [3, 3, 1],
    accent: G,
    parts: Array.from({ length: 9 }).map((_, i) => ({
      offset: [i % 3, Math.floor(i / 3), 0] as [number, number, number],
      type: "voxel_1x1",
      color: G,
    })),
  },
  {
    id: "mc_arch",
    name: "Stone arch",
    ko: "돌 아치",
    track: "minecraft",
    category: "structural",
    size: [5, 1, 4],
    accent: K,
    parts: [
      { offset: [0, 0, 0], type: "voxel_1x1", color: K },
      { offset: [0, 0, 1], type: "voxel_1x1", color: K },
      { offset: [0, 0, 2], type: "voxel_1x1", color: K },
      { offset: [4, 0, 0], type: "voxel_1x1", color: K },
      { offset: [4, 0, 1], type: "voxel_1x1", color: K },
      { offset: [4, 0, 2], type: "voxel_1x1", color: K },
      { offset: [0, 0, 3], type: "voxel_1x1", color: K },
      { offset: [1, 0, 3], type: "voxel_1x1", color: K },
      { offset: [2, 0, 3], type: "voxel_1x1", color: K },
      { offset: [3, 0, 3], type: "voxel_1x1", color: K },
      { offset: [4, 0, 3], type: "voxel_1x1", color: K },
    ],
  },
  {
    id: "mc_pool",
    name: "Pool 3×3",
    ko: "수영장 3×3",
    track: "minecraft",
    category: "nature",
    size: [3, 3, 1],
    accent: B,
    parts: Array.from({ length: 9 }).map((_, i) => ({
      offset: [i % 3, Math.floor(i / 3), 0] as [number, number, number],
      type: "voxel_1x1",
      color: B,
    })),
  },
];

export function modulesForTrack(track: Track): BuildModule[] {
  return MODULES.filter((m) => m.track === track);
}
