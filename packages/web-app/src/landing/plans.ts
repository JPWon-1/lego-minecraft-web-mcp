// Pixel-art plans used by the hero chat→build animation.
// Each plan is a 13-column × N-row grid of color strings (or null for empty).
// Drawn top→bottom like a sprite; the renderer will place bottom→top, left→right
// so the animation feels like real stacking.

import { LEGO } from "./primitives";

const R = LEGO.red;
const W = LEGO.white;
const B = LEGO.blue;
const Y = LEGO.yellow;
const G = LEGO.green;
const K = LEGO.grey;
const O = LEGO.orange;
const _ = null;

export type PixelPlan = (string | null)[][];
export const GRID_COLS = 13;

export const PLANS: Record<string, PixelPlan> = {
  // "빨간 지붕 집, 창문 두 개랑 문" — matches ch-001 (5×5 cottage)
  house: [
    [_, _, _, _, _, _, R, _, _, _, _, _, _],
    [_, _, _, _, _, R, R, R, _, _, _, _, _],
    [_, _, _, _, R, R, R, R, R, _, _, _, _],
    [_, _, _, R, R, R, R, R, R, R, _, _, _],
    [_, _, W, W, W, W, W, W, W, W, W, _, _],
    [_, _, W, B, B, W, W, W, B, B, W, _, _],
    [_, _, W, B, B, W, Y, W, B, B, W, _, _],
    [_, _, W, W, W, W, Y, W, W, W, W, _, _],
    [G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
  // "2층 오두막, 층마다 창문 두 개씩" — matches ch-003 vibe
  cottage2: [
    [_, _, _, _, R, R, R, R, R, _, _, _, _],
    [_, _, _, R, R, R, R, R, R, R, _, _, _],
    [_, _, R, R, R, R, R, R, R, R, R, _, _],
    [_, _, O, W, W, W, W, W, W, W, O, _, _],
    [_, _, O, W, B, B, W, B, B, W, O, _, _],
    [_, _, O, W, W, W, W, W, W, W, O, _, _],
    [_, _, O, W, B, B, W, B, B, W, O, _, _],
    [_, _, O, W, W, W, Y, W, W, W, O, _, _],
    [_, _, O, O, O, O, Y, O, O, O, O, _, _],
    [G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
  // "돌탑, 꼭대기에 빨간 깃발" — matches ch-004 tower
  tower: [
    [_, _, _, _, _, _, R, _, _, _, _, _, _],
    [_, _, _, _, _, _, R, R, R, _, _, _, _],
    [_, _, _, _, _, K, K, K, _, _, _, _, _],
    [_, _, _, _, K, _, K, _, K, _, _, _, _],
    [_, _, _, _, K, W, K, W, K, _, _, _, _],
    [_, _, _, _, K, K, K, K, K, _, _, _, _],
    [_, _, _, _, K, B, K, B, K, _, _, _, _],
    [_, _, _, _, K, K, K, K, K, _, _, _, _],
    [_, _, _, _, K, B, K, B, K, _, _, _, _],
    [_, _, _, _, K, K, Y, K, K, _, _, _, _],
    [G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
};

export interface PromptSpec {
  ko: string;
  en: string;
  model: keyof typeof PLANS;
  /** Suggested challenge id to route to when user clicks "Let's BUILD" */
  suggestedChallenge?: string;
}

export const PROMPTS: PromptSpec[] = [
  {
    ko: "빨간 지붕 집 지어줘, 창문 두 개랑 문",
    en: "red-roof house, 2 windows + door",
    model: "house",
    suggestedChallenge: "ch-001",
  },
  {
    ko: "2층 오두막, 층마다 창문 두 개씩",
    en: "two-story cottage, 2 windows per floor",
    model: "cottage2",
    suggestedChallenge: "ch-003",
  },
  {
    ko: "돌탑 지어줘, 꼭대기에 빨간 깃발",
    en: "stone tower with a red flag on top",
    model: "tower",
    suggestedChallenge: "ch-004",
  },
];
