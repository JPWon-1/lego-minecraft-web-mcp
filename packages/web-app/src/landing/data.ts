// Landing page data.
// Challenge metadata MIRRORS packages/*/challenges/*/manifest.json.
// Keep in sync — or at build time, replace with a manifest loader.

import { LEGO } from "./primitives";

export type Difficulty = "easy" | "medium" | "hard";

export interface ChallengeMeta {
  id: string;
  title: string;
  en: string;
  difficulty: Difficulty;
  grid: string;
  blocks: number;
  time: string;
}

export const CHALLENGES: ChallengeMeta[] = [
  {
    id: "ch-001",
    title: "작은 오두막",
    en: "Tiny Cottage",
    difficulty: "easy",
    grid: "10×10×8",
    blocks: 73,
    time: "~2min",
  },
  {
    id: "ch-002",
    title: "회색 창고",
    en: "Grey Warehouse",
    difficulty: "easy",
    grid: "10×10×6",
    blocks: 40,
    time: "~3min",
  },
  {
    id: "ch-003",
    title: "2층 주택",
    en: "Two-story House",
    difficulty: "medium",
    grid: "10×10×12",
    blocks: 176,
    time: "~5min",
  },
  {
    id: "ch-004",
    title: "탑",
    en: "The Tower",
    difficulty: "medium",
    grid: "10×10×12",
    blocks: 74,
    time: "~5min",
  },
  {
    id: "ch-005",
    title: "ㄱ자 별장",
    en: "L-Villa",
    difficulty: "hard",
    grid: "15×15×12",
    blocks: 362,
    time: "~10min",
  },
];

export const DIFF_COLOR: Record<
  Difficulty,
  { bg: string; fg: string; label: string }
> = {
  easy: { bg: "#00852B", fg: "#ffffff", label: "EASY" },
  medium: { bg: "#FFCD00", fg: "#1a1a1a", label: "MEDIUM" },
  hard: { bg: "#E4202B", fg: "#ffffff", label: "HARD" },
};

// Palettes for generated brick silhouettes in challenge cards
export const CARD_PALETTES: string[][] = [
  [LEGO.red, LEGO.white, LEGO.yellow],
  [LEGO.grey, LEGO.white, LEGO.black],
  [LEGO.blue, LEGO.white, LEGO.orange],
  [LEGO.red, LEGO.grey, LEGO.yellow],
  [LEGO.green, LEGO.white, LEGO.red],
];
