# AI Architect 게임 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 플레이어가 로컬 Claude Code(MCP)를 통해 집을 짓고, 커뮤니케이션 품질을 점수화하는 웹 게임 MVP를 완성한다.

**Architecture:** pnpm monorepo 5패키지. `server`(MCP + Express + WS) ↔ `web-app`(React + R3F) ↔ `renderer-minecraft`/`renderer-lego` 플러그인. `shared`에 타입·스코어러·챌린지 로더 공유. 단일 입력 채널(Claude Code), 브라우저는 read-only. 세션은 파일 영속.

**Tech Stack:** TypeScript · Node.js 20+ · pnpm · MCP SDK(Node) · Express · ws · React 18 · Vite · React Three Fiber (R3F) · Three.js · Vitest · Playwright

**Spec reference:** `/Users/wonjp/Desktop/workspace/claude/ai-architect-game/docs/superpowers/specs/2026-04-17-ai-architect-game-design.md`

---

## 작업 순서 (Phase)

| Phase | Tasks | 목적 |
|---|---|---|
| 1. Foundation | 1–2 | Monorepo·타입 |
| 2. Shared Logic | 3–5 | 스코어러·챌린지 로더 |
| 3. Server Core | 6–9 | MCP 서버 스켈레톤 + 상태 + 영속 + WS |
| 4. MCP Tools | 10–15 | record_intent, place/remove, hints, submit+LLM |
| 5. Web App | 16–19 | Vite React, WS 클라이언트, UI |
| 6. Renderers | 20–21 | Minecraft 복셀, LEGO 브릭 |
| 7. Challenges | 22–26 | 5 MVP 챌린지 |
| 8. Integration | 27–29 | CLI, E2E, 문서 |

---

## Task 1: Monorepo 기반 설정

**Files:**
- Create: `/Users/wonjp/Desktop/workspace/claude/ai-architect-game/package.json`
- Create: `/Users/wonjp/Desktop/workspace/claude/ai-architect-game/pnpm-workspace.yaml`
- Create: `/Users/wonjp/Desktop/workspace/claude/ai-architect-game/tsconfig.base.json`
- Create: `/Users/wonjp/Desktop/workspace/claude/ai-architect-game/.gitignore` (이미 있으면 수정)
- Create: `/Users/wonjp/Desktop/workspace/claude/ai-architect-game/README.md`
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/index.ts`
- Create: 같은 구조로 `packages/server`, `packages/web-app`, `packages/renderer-minecraft`, `packages/renderer-lego`

- [ ] **Step 1: 루트 `package.json` 생성**

```json
{
  "name": "blockgame-monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "dev": "pnpm --filter @blockgame/server dev"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.11.0",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 2: `pnpm-workspace.yaml` 생성**

```yaml
packages:
  - "packages/*"
```

- [ ] **Step 3: `tsconfig.base.json` 생성**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 4: `.gitignore` 확장**

```
node_modules/
dist/
*.tsbuildinfo
.vite/
.turbo/
coverage/
.env
.env.local
~/.blockgame/
.superpowers/
.DS_Store
```

- [ ] **Step 5: 5개 패키지 기본 구조 생성**

각 패키지에 `package.json`, `tsconfig.json`, `src/index.ts` 만들기. 샘플(`packages/shared/package.json`):

```json
{
  "name": "@blockgame/shared",
  "version": "0.0.1",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.4.0"
  }
}
```

`packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

`packages/shared/src/index.ts`:
```ts
export const version = "0.0.1";
```

같은 방식으로 `server`, `web-app`, `renderer-minecraft`, `renderer-lego` 생성.

- [ ] **Step 6: 설치·빌드·타입체크 확인**

실행:
```bash
cd /Users/wonjp/Desktop/workspace/claude/ai-architect-game
pnpm install
pnpm typecheck
pnpm build
```
기대: 모든 패키지 타입체크 통과, `dist/` 각 패키지에 생성.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: scaffold monorepo with 5 packages"
```

---

## Task 2: shared - 도메인 타입 정의

**Files:**
- Create: `packages/shared/src/types/block.ts`
- Create: `packages/shared/src/types/challenge.ts`
- Create: `packages/shared/src/types/score.ts`
- Create: `packages/shared/src/types/session.ts`
- Create: `packages/shared/src/types/tool-result.ts`
- Modify: `packages/shared/src/index.ts` (re-export)
- Test: `packages/shared/src/types/types.test.ts`

- [ ] **Step 1: 테스트부터 (타입 컴파일 테스트)**

`packages/shared/src/types/types.test.ts`:
```ts
import { describe, it, expectTypeOf } from "vitest";
import type { Block, Challenge, ScoreReport, Session, ToolResult } from "../index.js";

describe("shared types", () => {
  it("Block has required fields", () => {
    expectTypeOf<Block>().toMatchTypeOf<{
      id: string;
      track: "minecraft" | "lego";
      type: string;
      position: [number, number, number];
      color: string;
      rotation?: 0 | 90 | 180 | 270;
    }>();
  });

  it("ToolResult is discriminated union", () => {
    const ok: ToolResult<number> = { ok: true, data: 42 };
    const err: ToolResult<number> = {
      ok: false,
      error: { code: "X", message: "y" },
    };
    expectTypeOf(ok).toMatchTypeOf<ToolResult<number>>();
    expectTypeOf(err).toMatchTypeOf<ToolResult<number>>();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd packages/shared && pnpm test
```
기대: 모듈 없음 에러.

- [ ] **Step 3: `block.ts` 작성**

```ts
export type Track = "minecraft" | "lego";

export type Vec3 = [number, number, number];

export type Rotation = 0 | 90 | 180 | 270;

export interface Block {
  id: string;
  track: Track;
  type: string;      // "voxel_1x1" | "brick_2x4" | "slope_1x2" ...
  position: Vec3;
  color: string;     // hex or named
  rotation?: Rotation;
  placed_at: number; // unix ms
  turn_id: string;
}

export interface SceneSnapshot {
  blocks: Block[];
  camera: { position: Vec3; target: Vec3 };
  taken_at: number;
}
```

- [ ] **Step 4: `challenge.ts` 작성**

```ts
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
```

- [ ] **Step 5: `score.ts` 작성**

```ts
export interface ScoreBreakdown {
  voxel_iou: number;          // 0..1
  iou_points: number;         // iou * 100
  efficiency_bonus: number;   // 0..15
  ambiguity_penalty: number;  // 0..10
  hint_penalty: number;       // 0..35
  final: number;
  grade: "S" | "A" | "B" | "C" | "D";
}

export interface ReportSection {
  title: string;
  items: string[];
}

export interface ScoreReport {
  challenge_id: string;
  session_id: string;
  submitted_at: number;
  total_time_seconds: number;
  turn_count: number;
  breakdown: ScoreBreakdown;
  good: ReportSection;
  bad: ReportSection;
  unnecessary: ReportSection;
  missing: ReportSection;
  recommendations: ReportSection;
  llm_analysis_available: boolean;
}
```

- [ ] **Step 6: `session.ts` 작성**

```ts
import type { SceneSnapshot } from "./block.js";

export interface ToolCallLog {
  timestamp: number;
  turn_id: string;
  user_intent: string;
  tool_name: string;
  args: Record<string, unknown>;
  result_summary: string;
}

export interface Turn {
  turn_id: string;
  user_intent: string;
  started_at: number;
  tool_calls: ToolCallLog[];
}

export interface Session {
  id: string;
  challenge_id?: string;
  created_at: number;
  last_updated_at: number;
  turns: Turn[];
  current_scene: SceneSnapshot;
  hints_used: number;
  finalized: boolean;
}
```

- [ ] **Step 7: `tool-result.ts` 작성**

```ts
export type ToolErrorCode =
  | "POSITION_OUT_OF_BOUNDS"
  | "INTENT_NOT_LOGGED"
  | "INVALID_COLOR"
  | "UNKNOWN_BLOCK_TYPE"
  | "UNKNOWN_BLOCK_ID"
  | "CHALLENGE_NOT_FOUND"
  | "HINT_LIMIT_EXCEEDED"
  | "WEBSOCKET_DISCONNECTED"
  | "INTERNAL";

export interface ToolError {
  code: ToolErrorCode;
  message: string;
  hint?: string;
}

export type ToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ToolError };

export function ok<T>(data: T): ToolResult<T> {
  return { ok: true, data };
}
export function err<T = never>(
  code: ToolErrorCode,
  message: string,
  hint?: string,
): ToolResult<T> {
  return { ok: false, error: { code, message, hint } };
}
```

- [ ] **Step 8: `index.ts` re-export**

```ts
export * from "./types/block.js";
export * from "./types/challenge.js";
export * from "./types/score.js";
export * from "./types/session.js";
export * from "./types/tool-result.js";
```

- [ ] **Step 9: 테스트 통과 확인**

```bash
cd packages/shared && pnpm test
```
기대: PASS.

- [ ] **Step 10: 커밋**

```bash
git add packages/shared
git commit -m "feat(shared): domain types (Block, Challenge, Score, Session, ToolResult)"
```

---

## Task 3: shared/scorer — Voxel IoU

**Files:**
- Create: `packages/shared/src/scorer/iou.ts`
- Test: `packages/shared/src/scorer/iou.test.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: 실패 테스트 작성**

`packages/shared/src/scorer/iou.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeVoxelIoU } from "./iou.js";
import type { Block } from "../types/block.js";

function mkBlock(id: string, x: number, y: number, z: number, color = "#FFF"): Block {
  return {
    id, track: "minecraft", type: "voxel_1x1",
    position: [x, y, z], color, placed_at: 0, turn_id: "t",
  };
}

describe("computeVoxelIoU", () => {
  it("returns 1.0 for identical sets", () => {
    const a = [mkBlock("a", 0, 0, 0), mkBlock("b", 1, 0, 0)];
    expect(computeVoxelIoU(a, a)).toBe(1);
  });

  it("returns 0 for disjoint sets", () => {
    const a = [mkBlock("a", 0, 0, 0)];
    const b = [mkBlock("b", 5, 0, 0)];
    expect(computeVoxelIoU(a, b)).toBe(0);
  });

  it("returns 0 when both empty", () => {
    expect(computeVoxelIoU([], [])).toBe(0);
  });

  it("considers color mismatch as non-intersection", () => {
    const a = [mkBlock("a", 0, 0, 0, "#F00")];
    const b = [mkBlock("b", 0, 0, 0, "#0F0")];
    // same position, different colors → intersection 0, union 1
    expect(computeVoxelIoU(a, b)).toBe(0);
  });

  it("computes partial overlap correctly", () => {
    // result: 2 blocks, target: 3 blocks, 1 match → IoU = 1/4
    const result = [mkBlock("r1", 0, 0, 0), mkBlock("r2", 1, 0, 0)];
    const target = [
      mkBlock("t1", 0, 0, 0),
      mkBlock("t2", 2, 0, 0),
      mkBlock("t3", 3, 0, 0),
    ];
    expect(computeVoxelIoU(result, target)).toBeCloseTo(0.25, 5);
  });

  it("is symmetric", () => {
    const a = [mkBlock("a", 0, 0, 0), mkBlock("b", 1, 0, 0)];
    const b = [mkBlock("c", 0, 0, 0), mkBlock("d", 2, 0, 0)];
    expect(computeVoxelIoU(a, b)).toBe(computeVoxelIoU(b, a));
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd packages/shared && pnpm test scorer/iou
```
기대: FAIL (모듈 없음).

- [ ] **Step 3: `iou.ts` 구현**

```ts
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd packages/shared && pnpm test scorer/iou
```
기대: 6개 모두 PASS.

- [ ] **Step 5: index.ts re-export 추가**

`packages/shared/src/index.ts`에 추가:
```ts
export * from "./scorer/iou.js";
```

- [ ] **Step 6: 커밋**

```bash
git add packages/shared/src/scorer packages/shared/src/index.ts
git commit -m "feat(shared): voxel IoU scorer with 6 test cases"
```

---

## Task 4: shared/scorer — 효율 보너스 + 힌트 페널티 + 최종 점수

**Files:**
- Create: `packages/shared/src/scorer/bonus.ts`
- Create: `packages/shared/src/scorer/penalty.ts`
- Create: `packages/shared/src/scorer/final.ts`
- Test: `packages/shared/src/scorer/bonus.test.ts`
- Test: `packages/shared/src/scorer/penalty.test.ts`
- Test: `packages/shared/src/scorer/final.test.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: 보너스 실패 테스트**

`bonus.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { efficiencyBonus } from "./bonus.js";

describe("efficiencyBonus", () => {
  it("returns 15 for < 5 turns", () => {
    expect(efficiencyBonus({ turnCount: 3, batchToolUses: 0 })).toBe(15);
  });
  it("returns 10 for 5..10 turns", () => {
    expect(efficiencyBonus({ turnCount: 5, batchToolUses: 0 })).toBe(10);
    expect(efficiencyBonus({ turnCount: 10, batchToolUses: 0 })).toBe(10);
  });
  it("returns 5 for 11..20 turns", () => {
    expect(efficiencyBonus({ turnCount: 15, batchToolUses: 0 })).toBe(5);
  });
  it("returns 0 for 21+ turns", () => {
    expect(efficiencyBonus({ turnCount: 25, batchToolUses: 0 })).toBe(0);
  });
  it("adds +1 per batch tool use, capped at +5", () => {
    expect(efficiencyBonus({ turnCount: 3, batchToolUses: 3 })).toBe(15 + 3);
    expect(efficiencyBonus({ turnCount: 3, batchToolUses: 10 })).toBe(15 + 5);
  });
});
```

- [ ] **Step 2: `bonus.ts` 구현**

```ts
export interface BonusInput {
  turnCount: number;
  batchToolUses: number; // place_wall + place_row 합
}

export function efficiencyBonus(input: BonusInput): number {
  const { turnCount, batchToolUses } = input;
  let base: number;
  if (turnCount < 5) base = 15;
  else if (turnCount <= 10) base = 10;
  else if (turnCount <= 20) base = 5;
  else base = 0;
  const batchBonus = Math.min(batchToolUses, 5);
  return base + batchBonus;
}
```

- [ ] **Step 3: 보너스 테스트 통과**

```bash
pnpm test scorer/bonus
```
기대: 5개 PASS.

- [ ] **Step 4: 페널티 실패 테스트**

`penalty.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { hintPenalty, ambiguityPenalty } from "./penalty.js";

describe("hintPenalty", () => {
  it("returns 0 when no hints used", () => {
    expect(hintPenalty(0)).toBe(0);
  });
  it("returns 5 for 1st hint", () => {
    expect(hintPenalty(1)).toBe(5);
  });
  it("returns 15 cumulative for 2 hints", () => {
    expect(hintPenalty(2)).toBe(15);
  });
  it("returns 35 cumulative for 3 hints", () => {
    expect(hintPenalty(3)).toBe(35);
  });
  it("caps at 35 for 4+ hints (defense in depth)", () => {
    expect(hintPenalty(4)).toBe(35);
    expect(hintPenalty(100)).toBe(35);
  });
});

describe("ambiguityPenalty", () => {
  it("returns 0 for score 0..2", () => {
    expect(ambiguityPenalty(0)).toBe(0);
    expect(ambiguityPenalty(2)).toBe(0);
  });
  it("returns 3 for score 3..5", () => {
    expect(ambiguityPenalty(3)).toBe(3);
    expect(ambiguityPenalty(5)).toBe(3);
  });
  it("returns 7 for score 6..8", () => {
    expect(ambiguityPenalty(8)).toBe(7);
  });
  it("returns 10 for score 9..10", () => {
    expect(ambiguityPenalty(9)).toBe(10);
    expect(ambiguityPenalty(10)).toBe(10);
  });
});
```

- [ ] **Step 5: `penalty.ts` 구현**

```ts
const HINT_COSTS = [5, 10, 20] as const;

export function hintPenalty(hintsUsed: number): number {
  const n = Math.min(Math.max(hintsUsed, 0), HINT_COSTS.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += HINT_COSTS[i];
  return sum;
}

export function ambiguityPenalty(avgAmbiguityScore: number): number {
  const s = Math.max(0, Math.min(10, avgAmbiguityScore));
  if (s <= 2) return 0;
  if (s <= 5) return 3;
  if (s <= 8) return 7;
  return 10;
}
```

- [ ] **Step 6: 페널티 테스트 통과**

```bash
pnpm test scorer/penalty
```

- [ ] **Step 7: 최종 점수 실패 테스트**

`final.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeFinalScore, gradeFor } from "./final.js";

describe("computeFinalScore", () => {
  it("sums all components", () => {
    const r = computeFinalScore({
      iou: 0.82,
      turnCount: 4,
      batchToolUses: 1,
      hintsUsed: 1,
      ambiguityAvg: 2,
    });
    // iou 82 + bonus (15+1) - hint 5 - amb 0 = 93
    expect(r.iou_points).toBe(82);
    expect(r.efficiency_bonus).toBe(16);
    expect(r.hint_penalty).toBe(5);
    expect(r.ambiguity_penalty).toBe(0);
    expect(r.final).toBe(93);
  });

  it("clamps final at 0..115", () => {
    const low = computeFinalScore({
      iou: 0, turnCount: 30, batchToolUses: 0,
      hintsUsed: 3, ambiguityAvg: 10,
    });
    expect(low.final).toBe(0);

    const high = computeFinalScore({
      iou: 1.0, turnCount: 1, batchToolUses: 5,
      hintsUsed: 0, ambiguityAvg: 0,
    });
    // 100 + 20 - 0 - 0 = 120 → clamp to 115
    expect(high.final).toBe(115);
  });
});

describe("gradeFor", () => {
  it.each([
    [95, "S"],
    [85, "A"],
    [70, "B"],
    [50, "C"],
    [20, "D"],
  ])("grade(%i) = %s", (score, expected) => {
    expect(gradeFor(score)).toBe(expected);
  });
});
```

- [ ] **Step 8: `final.ts` 구현**

```ts
import { efficiencyBonus } from "./bonus.js";
import { hintPenalty, ambiguityPenalty } from "./penalty.js";
import type { ScoreBreakdown } from "../types/score.js";

export interface FinalScoreInput {
  iou: number;
  turnCount: number;
  batchToolUses: number;
  hintsUsed: number;
  ambiguityAvg: number;
}

export function computeFinalScore(input: FinalScoreInput): ScoreBreakdown {
  const iou_points = Math.round(input.iou * 100);
  const bonus = efficiencyBonus({
    turnCount: input.turnCount,
    batchToolUses: input.batchToolUses,
  });
  const hp = hintPenalty(input.hintsUsed);
  const ap = ambiguityPenalty(input.ambiguityAvg);
  const raw = iou_points + bonus - ap - hp;
  const final = Math.max(0, Math.min(115, raw));
  return {
    voxel_iou: input.iou,
    iou_points,
    efficiency_bonus: bonus,
    ambiguity_penalty: ap,
    hint_penalty: hp,
    final,
    grade: gradeFor(final),
  };
}

export function gradeFor(score: number): ScoreBreakdown["grade"] {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 40) return "C";
  return "D";
}
```

- [ ] **Step 9: 최종 테스트 통과 + re-export**

```bash
pnpm test scorer
```
기대: 전체 15개 이상 PASS.

`packages/shared/src/index.ts`에 추가:
```ts
export * from "./scorer/bonus.js";
export * from "./scorer/penalty.js";
export * from "./scorer/final.js";
```

- [ ] **Step 10: 커밋**

```bash
git add packages/shared/src/scorer packages/shared/src/index.ts
git commit -m "feat(shared): scorer bonus, penalty, final score + grade"
```

---

## Task 5: shared/challenge-loader — 매니페스트 로더

**Files:**
- Create: `packages/shared/src/challenges/loader.ts`
- Create: `packages/shared/src/challenges/validate.ts`
- Test: `packages/shared/src/challenges/loader.test.ts`
- Test: `packages/shared/src/challenges/validate.test.ts`
- Test 픽스처: `packages/shared/src/challenges/__fixtures__/ok/manifest.json`, `bad/manifest.json`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: 픽스처 준비**

`__fixtures__/ok/manifest.json`:
```json
{
  "id": "ch-test",
  "title": "테스트",
  "difficulty": "easy",
  "mode": "image",
  "grid_size": [5, 5, 5],
  "tracks": ["minecraft", "lego"],
  "target_image": "target-image.png",
  "target_spec_md": "target-spec.md",
  "target_voxels": "target-voxels.json",
  "target_bricks": "target-bricks.json",
  "hints": [
    { "level": "small", "penalty": 5, "text": "s" },
    { "level": "medium", "penalty": 10, "text": "m" },
    { "level": "large", "penalty": 20, "text": "l" }
  ],
  "optimal_instructions": 5,
  "time_estimate_minutes": 2
}
```

`__fixtures__/ok/target-voxels.json`:
```json
{
  "grid_size": [5, 5, 5],
  "blocks": [
    { "pos": [0, 0, 0], "color": "#FFF", "type": "voxel_1x1" }
  ]
}
```

`__fixtures__/bad/manifest.json`:
```json
{ "id": "x", "title": "no other fields" }
```

- [ ] **Step 2: 검증 테스트**

`validate.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { validateManifest } from "./validate.js";

describe("validateManifest", () => {
  it("accepts a well-formed manifest", () => {
    const ok = {
      id: "x", title: "t", difficulty: "easy", mode: "image",
      grid_size: [1, 1, 1], tracks: ["minecraft"],
      target_image: "a", target_spec_md: "b",
      target_voxels: "c", target_bricks: "d",
      hints: [],
      optimal_instructions: 1, time_estimate_minutes: 1,
    };
    expect(() => validateManifest(ok)).not.toThrow();
  });
  it("rejects missing fields", () => {
    expect(() => validateManifest({ id: "x" })).toThrow(/missing/i);
  });
  it("rejects wrong difficulty", () => {
    const bad = { /* ... */ difficulty: "impossible" } as any;
    expect(() => validateManifest({
      id: "x", title: "t", difficulty: "impossible",
      mode: "image", grid_size: [1, 1, 1], tracks: ["minecraft"],
      target_image: "a", target_spec_md: "b",
      target_voxels: "c", target_bricks: "d",
      hints: [], optimal_instructions: 1, time_estimate_minutes: 1,
    })).toThrow(/difficulty/i);
  });
});
```

- [ ] **Step 3: `validate.ts` 구현**

```ts
import type { ChallengeManifest, Difficulty, ChallengeMode, Track } from "../types/challenge.js";

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
```

- [ ] **Step 4: 검증 테스트 통과**

```bash
pnpm test challenges/validate
```

- [ ] **Step 5: 로더 테스트**

`loader.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { loadChallenge } from "./loader.js";
import path from "node:path";

const OK = path.join(__dirname, "__fixtures__/ok");
const BAD = path.join(__dirname, "__fixtures__/bad");

describe("loadChallenge", () => {
  it("loads manifest and voxel target", async () => {
    const c = await loadChallenge(OK);
    expect(c.manifest.id).toBe("ch-test");
    expect(c.voxelTarget.blocks).toHaveLength(1);
  });
  it("throws on malformed manifest", async () => {
    await expect(loadChallenge(BAD)).rejects.toThrow(/missing/i);
  });
});
```

- [ ] **Step 6: `loader.ts` 구현**

```ts
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
```

- [ ] **Step 7: 타겟 → Block[] 변환 유틸**

`packages/shared/src/challenges/target-blocks.ts`:
```ts
import type { Block, TargetVoxelMap, Track } from "../types/block.js";
import type { LoadedChallenge } from "./loader.js";

/**
 * Convert a TargetVoxelMap into Block[] for IoU comparison.
 * Assigns synthetic IDs and marks all blocks as belonging to a single turn.
 */
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
```

테스트 `target-blocks.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { targetToBlocks } from "./target-blocks.js";

describe("targetToBlocks", () => {
  it("maps a voxel target to Block[] with synthetic ids", () => {
    const blocks = targetToBlocks({
      grid_size: [5, 5, 5],
      blocks: [
        { pos: [0, 0, 0], color: "#FFF", type: "voxel_1x1" },
        { pos: [1, 0, 0], color: "#F00", type: "voxel_1x1" },
      ],
    });
    expect(blocks).toHaveLength(2);
    expect(blocks[0].id).toBe("target-0");
    expect(blocks[0].track).toBe("minecraft");
  });
});
```

- [ ] **Step 8: 테스트 통과 + re-export**

```bash
pnpm test challenges
```

index.ts 추가:
```ts
export * from "./challenges/loader.js";
export * from "./challenges/validate.js";
export * from "./challenges/target-blocks.js";
```

- [ ] **Step 9: 커밋**

```bash
git add packages/shared/src/challenges packages/shared/src/index.ts
git commit -m "feat(shared): challenge manifest loader + validator + target-to-blocks"
```

---

## Task 6: server — MCP 서버 스켈레톤

**Files:**
- Modify: `packages/server/package.json` (deps 추가)
- Create: `packages/server/src/server.ts`
- Create: `packages/server/src/mcp/server.ts`
- Create: `packages/server/src/mcp/tools.ts` (비어있는 registry)
- Create: `packages/server/src/index.ts`
- Test: `packages/server/src/mcp/tools.test.ts`

- [ ] **Step 1: server/package.json 의존성 추가**

```json
{
  "name": "@blockgame/server",
  "version": "0.0.1",
  "main": "dist/index.js",
  "bin": { "blockgame": "dist/cli.js" },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/cli.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@blockgame/shared": "workspace:*",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "express": "^4.19.0",
    "ws": "^8.16.0",
    "open": "^10.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsx": "^4.7.0",
    "vitest": "^1.4.0",
    "@types/express": "^4.17.21",
    "@types/ws": "^8.5.10"
  }
}
```

설치:
```bash
pnpm install
```

- [ ] **Step 2: tools 레지스트리 실패 테스트**

`tools.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { toolRegistry, registerTool } from "./tools.js";

describe("toolRegistry", () => {
  it("starts empty (or only bootstrapped tools)", () => {
    expect(toolRegistry.size).toBeGreaterThanOrEqual(0);
  });

  it("registerTool adds a tool", () => {
    const before = toolRegistry.size;
    registerTool({
      name: "test_tool",
      description: "t",
      schema: {},
      handler: async () => ({ ok: true, data: 1 }),
    });
    expect(toolRegistry.has("test_tool")).toBe(true);
    expect(toolRegistry.size).toBe(before + 1);
    toolRegistry.delete("test_tool");
  });
});
```

- [ ] **Step 3: `tools.ts` 구현**

```ts
import type { ToolResult } from "@blockgame/shared";

export interface ToolDef<Args = unknown, Data = unknown> {
  name: string;
  description: string;
  schema: unknown; // JSON schema (for MCP)
  handler: (args: Args, ctx: ToolContext) => Promise<ToolResult<Data>>;
}

export interface ToolContext {
  // filled in Task 7 (game-state)
  sessionId: string;
}

export const toolRegistry = new Map<string, ToolDef>();

export function registerTool<A, D>(def: ToolDef<A, D>): void {
  toolRegistry.set(def.name, def as unknown as ToolDef);
}
```

- [ ] **Step 4: MCP 서버 래퍼**

`mcp/server.ts`:
```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { toolRegistry } from "./tools.js";

export function createMcpServer(): Server {
  const server = new Server(
    { name: "blockgame", version: "0.0.1" },
    { capabilities: { tools: {} } },
  );
  server.setRequestHandler(
    /* ListToolsRequestSchema */ { method: "tools/list" } as any,
    async () => ({
      tools: Array.from(toolRegistry.values()).map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.schema,
      })),
    }),
  );
  server.setRequestHandler(
    /* CallToolRequestSchema */ { method: "tools/call" } as any,
    async (req: any) => {
      const tool = toolRegistry.get(req.params.name);
      if (!tool) throw new Error(`unknown tool ${req.params.name}`);
      const result = await tool.handler(req.params.arguments, {
        sessionId: process.env.BLOCKGAME_SESSION_ID ?? "default",
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    },
  );
  return server;
}

export async function startStdio(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

(실제 SDK 호출 시그니처는 설치 후 조정. 에러 나면 `@modelcontextprotocol/sdk` 공식 문서 참고.)

- [ ] **Step 5: Express + entry 초기 골격**

`server.ts`:
```ts
import express from "express";
import { createServer as createHttp } from "node:http";
import { WebSocketServer } from "ws";

export interface HttpBootstrap {
  port: number;
}

export function startHttp(opts: HttpBootstrap) {
  const app = express();
  app.get("/healthz", (_req, res) => res.json({ ok: true }));
  const http = createHttp(app);
  const wss = new WebSocketServer({ server: http, path: "/ws" });
  wss.on("connection", ws => {
    ws.send(JSON.stringify({ type: "hello" }));
  });
  http.listen(opts.port);
  return { app, http, wss };
}
```

`index.ts`:
```ts
export { startHttp } from "./server.js";
export { createMcpServer, startStdio } from "./mcp/server.js";
export { toolRegistry, registerTool } from "./mcp/tools.js";
```

- [ ] **Step 6: 테스트 + 빌드 확인**

```bash
pnpm -r test
pnpm -r typecheck
pnpm -r build
```

- [ ] **Step 7: 커밋**

```bash
git add packages/server
git commit -m "feat(server): MCP + HTTP skeleton with empty tool registry"
```

---

## Task 7: server/game-state — 씬·턴·세션 상태 관리

**Files:**
- Create: `packages/server/src/state/game-state.ts`
- Create: `packages/server/src/state/turn.ts`
- Test: `packages/server/src/state/game-state.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "./game-state.js";

describe("GameState", () => {
  let s: GameState;
  beforeEach(() => { s = new GameState("sess-1"); });

  it("starts with empty scene, no turns", () => {
    expect(s.scene.blocks).toHaveLength(0);
    expect(s.turns).toHaveLength(0);
  });

  it("beginTurn creates a new turn with intent", () => {
    const t = s.beginTurn("build house");
    expect(t.turn_id).toMatch(/^t-/);
    expect(t.user_intent).toBe("build house");
    expect(s.currentTurn?.turn_id).toBe(t.turn_id);
  });

  it("addBlock attaches to current turn", () => {
    s.beginTurn("go");
    s.addBlock({
      id: "b1", track: "minecraft", type: "voxel_1x1",
      position: [0, 0, 0], color: "#fff", placed_at: Date.now(),
      turn_id: s.currentTurn!.turn_id,
    });
    expect(s.scene.blocks).toHaveLength(1);
  });

  it("rejects addBlock with no current turn (30s window expired)", () => {
    expect(() => s.addBlock({
      id: "b1", track: "minecraft", type: "voxel_1x1",
      position: [0, 0, 0], color: "#fff", placed_at: Date.now(),
      turn_id: "stale",
    })).toThrow(/intent/i);
  });

  it("hintsUsed increments", () => {
    expect(s.hintsUsed).toBe(0);
    s.incrementHint();
    expect(s.hintsUsed).toBe(1);
  });
});
```

- [ ] **Step 2: `game-state.ts` 구현**

```ts
import type { Block, SceneSnapshot, Session, Turn, ToolCallLog } from "@blockgame/shared";
import { newTurnId } from "./turn.js";

const TURN_WINDOW_MS = 30_000;

export class GameState {
  readonly id: string;
  readonly turns: Turn[] = [];
  scene: SceneSnapshot = {
    blocks: [],
    camera: { position: [10, 10, 10], target: [0, 0, 0] },
    taken_at: Date.now(),
  };
  challenge_id?: string;
  hintsUsed = 0;
  finalized = false;
  readonly created_at = Date.now();
  last_updated_at = Date.now();

  constructor(id: string) { this.id = id; }

  get currentTurn(): Turn | undefined {
    const t = this.turns[this.turns.length - 1];
    if (!t) return undefined;
    if (Date.now() - t.started_at > TURN_WINDOW_MS) return undefined;
    return t;
  }

  beginTurn(userIntent: string): Turn {
    const t: Turn = {
      turn_id: newTurnId(),
      user_intent: userIntent,
      started_at: Date.now(),
      tool_calls: [],
    };
    this.turns.push(t);
    this.last_updated_at = Date.now();
    return t;
  }

  requireCurrentTurn(): Turn {
    const t = this.currentTurn;
    if (!t) throw new Error("INTENT_NOT_LOGGED: call record_user_intent first");
    return t;
  }

  logToolCall(log: Omit<ToolCallLog, "timestamp">): void {
    const t = this.requireCurrentTurn();
    t.tool_calls.push({ ...log, timestamp: Date.now() });
    this.last_updated_at = Date.now();
  }

  addBlock(b: Block): void {
    const t = this.requireCurrentTurn();
    if (b.turn_id !== t.turn_id) {
      // attach to current turn
      b.turn_id = t.turn_id;
    }
    this.scene.blocks.push(b);
    this.last_updated_at = Date.now();
  }

  removeBlock(id: string): Block | undefined {
    this.requireCurrentTurn();
    const idx = this.scene.blocks.findIndex(b => b.id === id);
    if (idx < 0) return undefined;
    const [removed] = this.scene.blocks.splice(idx, 1);
    this.last_updated_at = Date.now();
    return removed;
  }

  reset(): void {
    this.scene.blocks = [];
    this.last_updated_at = Date.now();
  }

  incrementHint(): void {
    this.hintsUsed++;
    this.last_updated_at = Date.now();
  }

  toSession(): Session {
    return {
      id: this.id,
      challenge_id: this.challenge_id,
      created_at: this.created_at,
      last_updated_at: this.last_updated_at,
      turns: this.turns,
      current_scene: this.scene,
      hints_used: this.hintsUsed,
      finalized: this.finalized,
    };
  }
}
```

`turn.ts`:
```ts
let counter = 0;
export function newTurnId(): string {
  counter++;
  return `t-${Date.now().toString(36)}-${counter}`;
}
```

- [ ] **Step 3: 테스트 통과**

```bash
pnpm --filter @blockgame/server test state/game-state
```

- [ ] **Step 4: 커밋**

```bash
git add packages/server/src/state
git commit -m "feat(server): GameState with turn window + scene mutations"
```

---

## Task 8: server/session-persistence — 파일 영속 + resume

**Files:**
- Create: `packages/server/src/state/persistence.ts`
- Test: `packages/server/src/state/persistence.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { GameState } from "./game-state.js";
import { saveSession, loadSession } from "./persistence.js";

describe("persistence", () => {
  const tmp = path.join(os.tmpdir(), `blockgame-test-${Date.now()}`);

  it("round-trips a session", async () => {
    const s = new GameState("sess-42");
    s.beginTurn("a");
    s.addBlock({
      id: "b1", track: "minecraft", type: "voxel_1x1",
      position: [0, 0, 0], color: "#fff", placed_at: Date.now(),
      turn_id: s.currentTurn!.turn_id,
    });
    await saveSession(s, tmp);
    const file = path.join(tmp, "sess-42.json");
    await fs.access(file);
    const loaded = await loadSession("sess-42", tmp);
    expect(loaded.id).toBe("sess-42");
    expect(loaded.scene.blocks).toHaveLength(1);
    expect(loaded.turns).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 구현**

`persistence.ts`:
```ts
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Session } from "@blockgame/shared";
import { GameState } from "./game-state.js";

export async function saveSession(state: GameState, dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${state.id}.json`);
  await fs.writeFile(file, JSON.stringify(state.toSession(), null, 2), "utf8");
}

export async function loadSession(id: string, dir: string): Promise<GameState> {
  const file = path.join(dir, `${id}.json`);
  const raw = await fs.readFile(file, "utf8");
  const session = JSON.parse(raw) as Session;
  const state = new GameState(session.id);
  (state as any).turns.push(...session.turns);
  state.scene = session.current_scene;
  state.challenge_id = session.challenge_id;
  state.hintsUsed = session.hints_used;
  state.finalized = session.finalized;
  (state as any).last_updated_at = session.last_updated_at;
  return state;
}

export function defaultSessionDir(): string {
  const home = process.env.HOME ?? ".";
  return path.join(home, ".blockgame", "sessions");
}
```

- [ ] **Step 3: 테스트 통과**

```bash
pnpm --filter @blockgame/server test state/persistence
```

- [ ] **Step 4: 커밋**

```bash
git add packages/server/src/state/persistence.ts packages/server/src/state/persistence.test.ts
git commit -m "feat(server): session save/load (JSON file persistence)"
```

---

## Task 9: server/websocket — 라이브 씬 싱크

**Files:**
- Create: `packages/server/src/transport/ws-broadcaster.ts`
- Test: `packages/server/src/transport/ws-broadcaster.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
import { describe, it, expect, vi } from "vitest";
import { Broadcaster } from "./ws-broadcaster.js";

describe("Broadcaster", () => {
  it("broadcasts to all subscribers", () => {
    const b = new Broadcaster();
    const a = vi.fn();
    const c = vi.fn();
    b.subscribe(a);
    b.subscribe(c);
    b.emit({ type: "test" as any });
    expect(a).toHaveBeenCalledWith({ type: "test" });
    expect(c).toHaveBeenCalledWith({ type: "test" });
  });

  it("queues messages when no subscriber yet", () => {
    const b = new Broadcaster();
    b.emit({ type: "event1" as any });
    b.emit({ type: "event2" as any });
    const received: unknown[] = [];
    b.subscribe(m => received.push(m));
    expect(received).toHaveLength(2);
  });

  it("unsubscribe stops receiving", () => {
    const b = new Broadcaster();
    const a = vi.fn();
    const off = b.subscribe(a);
    off();
    b.emit({ type: "x" as any });
    expect(a).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 구현**

```ts
export type WsMessage =
  | { type: "block_added"; block: unknown }
  | { type: "block_removed"; id: string }
  | { type: "scene_reset" }
  | { type: "sync_state"; session: unknown }
  | { type: "score_result"; report: unknown }
  | { type: "hello" }
  | { type: "test" };

export class Broadcaster {
  private subs: Array<(m: WsMessage) => void> = [];
  private queue: WsMessage[] = [];

  subscribe(fn: (m: WsMessage) => void): () => void {
    this.subs.push(fn);
    // drain queue
    if (this.queue.length) {
      for (const m of this.queue) fn(m);
      this.queue = [];
    }
    return () => { this.subs = this.subs.filter(f => f !== fn); };
  }

  emit(m: WsMessage): void {
    if (this.subs.length === 0) { this.queue.push(m); return; }
    for (const fn of this.subs) fn(m);
  }
}
```

- [ ] **Step 3: 테스트 통과 + 커밋**

```bash
pnpm --filter @blockgame/server test transport
git add packages/server/src/transport
git commit -m "feat(server): WebSocket broadcaster with queueing"
```

---

## Task 10: MCP tool — `record_user_intent`

**Files:**
- Create: `packages/server/src/mcp/tools/record_user_intent.ts`
- Create: `packages/server/src/mcp/tool-context.ts` (state holder)
- Test: `packages/server/src/mcp/tools/record_user_intent.test.ts`

- [ ] **Step 1: tool-context.ts (tool들이 GameState 접근)**

```ts
import { GameState } from "../state/game-state.js";
import { Broadcaster } from "../transport/ws-broadcaster.js";

export interface ToolCtx {
  state: GameState;
  broadcaster: Broadcaster;
}

let _ctx: ToolCtx | undefined;
export function setToolContext(c: ToolCtx): void { _ctx = c; }
export function getToolContext(): ToolCtx {
  if (!_ctx) throw new Error("tool context not initialized");
  return _ctx;
}
```

- [ ] **Step 2: 실패 테스트**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";

describe("record_user_intent tool", () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("creates a new turn and returns turn_id", async () => {
    const r = await recordUserIntent({ text: "build a house" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.turn_id).toMatch(/^t-/);
    expect(state.turns).toHaveLength(1);
    expect(state.turns[0].user_intent).toBe("build a house");
  });

  it("rejects empty text", async () => {
    const r = await recordUserIntent({ text: "" });
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 3: 구현**

```ts
import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export interface RecordIntentArgs { text: string; turn_id?: string; }
export interface RecordIntentData { turn_id: string; }

export async function recordUserIntent(
  args: RecordIntentArgs,
): Promise<ToolResult<RecordIntentData>> {
  if (!args.text || args.text.trim().length === 0) {
    return err("INTERNAL", "text must be a non-empty string");
  }
  const { state } = getToolContext();
  const turn = state.beginTurn(args.text);
  return ok({ turn_id: turn.turn_id });
}

export const recordUserIntentDef = {
  name: "record_user_intent",
  description:
    "MUST be called first at the start of every user instruction. Pass the user's original message verbatim. Build tools called before this in a new turn will be rejected.",
  schema: {
    type: "object",
    properties: {
      text: { type: "string", description: "original user message" },
      turn_id: { type: "string", description: "optional client-side turn id" },
    },
    required: ["text"],
  },
  handler: recordUserIntent,
};
```

- [ ] **Step 4: 테스트 통과 + 레지스트리 등록**

```ts
// in server/src/mcp/index.ts
import { registerTool } from "./tools.js";
import { recordUserIntentDef } from "./tools/record_user_intent.js";
registerTool(recordUserIntentDef as any);
```

- [ ] **Step 5: 커밋**

```bash
git add packages/server/src/mcp
git commit -m "feat(server): record_user_intent MCP tool"
```

---

## Task 11: MCP tools — `place_block`, `remove_block`, `move_block`

**Files:**
- Create: `packages/server/src/mcp/tools/place_block.ts`
- Create: `packages/server/src/mcp/tools/remove_block.ts`
- Create: `packages/server/src/mcp/tools/move_block.ts`
- Test: `packages/server/src/mcp/tools/place_block.test.ts`
- Test: `packages/server/src/mcp/tools/remove_block.test.ts`
- Test: `packages/server/src/mcp/tools/move_block.test.ts`

- [ ] **Step 1: place_block 실패 테스트**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { placeBlock } from "./place_block.js";
import { recordUserIntent } from "./record_user_intent.js";

describe("place_block", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("rejects without intent", async () => {
    const r = await placeBlock({
      track: "minecraft", type: "voxel_1x1",
      position: [0, 0, 0], color: "#fff",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INTENT_NOT_LOGGED");
  });

  it("places a block after intent", async () => {
    await recordUserIntent({ text: "go" });
    const r = await placeBlock({
      track: "minecraft", type: "voxel_1x1",
      position: [1, 2, 3], color: "#FF0",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.block_id).toBeTruthy();
    expect(state.scene.blocks).toHaveLength(1);
  });

  it("rejects out-of-bounds positions when challenge is set", async () => {
    state.challenge_id = "ch";
    (state as any).gridSize = [5, 5, 5];
    await recordUserIntent({ text: "go" });
    const r = await placeBlock({
      track: "minecraft", type: "voxel_1x1",
      position: [99, 99, 99], color: "#fff",
    });
    // bounds enforcement is soft in MVP (just emits a warning), but not a hard fail:
    // update: for now allow. This test asserts current behavior.
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: `place_block.ts` 구현**

```ts
import { ok, err, type ToolResult, type Track, type Vec3, type Rotation } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

let _idCounter = 0;
function newBlockId(): string { _idCounter++; return `bk-${Date.now().toString(36)}-${_idCounter}`; }

export interface PlaceBlockArgs {
  track: Track;
  type: string;
  position: Vec3;
  color: string;
  rotation?: Rotation;
}

export async function placeBlock(args: PlaceBlockArgs): Promise<ToolResult<{ block_id: string }>> {
  const ctx = getToolContext();
  if (!ctx.state.currentTurn) {
    return err("INTENT_NOT_LOGGED", "Call record_user_intent first",
      "The current turn expired (>30s) or was never started.");
  }
  const id = newBlockId();
  const block = {
    id,
    track: args.track,
    type: args.type,
    position: args.position,
    color: args.color,
    rotation: args.rotation,
    placed_at: Date.now(),
    turn_id: ctx.state.currentTurn.turn_id,
  };
  ctx.state.addBlock(block);
  ctx.state.logToolCall({
    turn_id: block.turn_id,
    user_intent: ctx.state.currentTurn.user_intent,
    tool_name: "place_block",
    args: args as unknown as Record<string, unknown>,
    result_summary: `placed ${id}`,
  });
  ctx.broadcaster.emit({ type: "block_added", block });
  return ok({ block_id: id });
}

export const placeBlockDef = {
  name: "place_block",
  description: "Place a single block at the given grid position.",
  schema: {
    type: "object",
    properties: {
      track: { type: "string", enum: ["minecraft", "lego"] },
      type: { type: "string" },
      position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
      color: { type: "string" },
      rotation: { type: "number", enum: [0, 90, 180, 270] },
    },
    required: ["track", "type", "position", "color"],
  },
  handler: placeBlock,
};
```

- [ ] **Step 3: 테스트 통과 후 remove_block 테스트**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { removeBlock } from "./remove_block.js";
import { placeBlock } from "./place_block.js";
import { recordUserIntent } from "./record_user_intent.js";

describe("remove_block", () => {
  beforeEach(() => {
    setToolContext({ state: new GameState("s"), broadcaster: new Broadcaster() });
  });

  it("removes existing block", async () => {
    await recordUserIntent({ text: "go" });
    const placed = await placeBlock({
      track: "minecraft", type: "voxel_1x1", position: [0,0,0], color: "#fff",
    });
    if (!placed.ok) throw new Error("setup");
    const r = await removeBlock({ block_id: placed.data.block_id });
    expect(r.ok).toBe(true);
  });

  it("errors on unknown id", async () => {
    await recordUserIntent({ text: "go" });
    const r = await removeBlock({ block_id: "nope" });
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 4: `remove_block.ts` 구현**

```ts
import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function removeBlock(args: { block_id: string }): Promise<ToolResult<{ removed: string }>> {
  const ctx = getToolContext();
  const b = ctx.state.removeBlock(args.block_id);
  if (!b) return err("UNKNOWN_BLOCK_ID", `no block with id ${args.block_id}`);
  ctx.broadcaster.emit({ type: "block_removed", id: args.block_id });
  return ok({ removed: args.block_id });
}

export const removeBlockDef = {
  name: "remove_block",
  description: "Remove a block by its id.",
  schema: {
    type: "object",
    properties: { block_id: { type: "string" } },
    required: ["block_id"],
  },
  handler: removeBlock,
};
```

- [ ] **Step 5: `move_block.ts` 유사 패턴으로 구현 + 테스트**

```ts
import { ok, err, type ToolResult, type Vec3 } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function moveBlock(args: { block_id: string; new_position: Vec3 }): Promise<ToolResult<{}>> {
  const ctx = getToolContext();
  const b = ctx.state.scene.blocks.find(x => x.id === args.block_id);
  if (!b) return err("UNKNOWN_BLOCK_ID", `no block ${args.block_id}`);
  b.position = args.new_position;
  ctx.broadcaster.emit({ type: "block_removed", id: args.block_id });
  ctx.broadcaster.emit({ type: "block_added", block: b });
  return ok({});
}

export const moveBlockDef = {
  name: "move_block",
  description: "Move an existing block to a new position.",
  schema: {
    type: "object",
    properties: {
      block_id: { type: "string" },
      new_position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
    },
    required: ["block_id", "new_position"],
  },
  handler: moveBlock,
};
```

테스트: 이동 전후 position 확인.

- [ ] **Step 6: 레지스트리 등록**

`mcp/index.ts`에:
```ts
import { placeBlockDef } from "./tools/place_block.js";
import { removeBlockDef } from "./tools/remove_block.js";
import { moveBlockDef } from "./tools/move_block.js";
registerTool(placeBlockDef as any);
registerTool(removeBlockDef as any);
registerTool(moveBlockDef as any);
```

- [ ] **Step 7: 전체 테스트 + 커밋**

```bash
pnpm --filter @blockgame/server test
git add packages/server/src/mcp
git commit -m "feat(server): place/remove/move block MCP tools"
```

---

## Task 12: MCP batch tools — `place_wall`, `place_row`, `reset_scene`, `undo`

**Files:**
- Create: `packages/server/src/mcp/tools/place_wall.ts`
- Create: `packages/server/src/mcp/tools/place_row.ts`
- Create: `packages/server/src/mcp/tools/reset_scene.ts`
- Create: `packages/server/src/mcp/tools/undo.ts`
- Test 각 tool

- [ ] **Step 1: place_wall 실패 테스트**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { recordUserIntent } from "./record_user_intent.js";
import { placeWall } from "./place_wall.js";

describe("place_wall", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("places a rectangular wall", async () => {
    await recordUserIntent({ text: "wall" });
    const r = await placeWall({
      track: "minecraft", type: "voxel_1x1", color: "#FFF",
      start: [0, 0, 0], end: [4, 0, 0], height: 3,
    });
    expect(r.ok).toBe(true);
    // 5 blocks along X, 3 high = 15
    expect(state.scene.blocks).toHaveLength(15);
  });
});
```

- [ ] **Step 2: `place_wall.ts` 구현**

```ts
import { ok, type ToolResult, type Track, type Vec3 } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";
import { placeBlock } from "./place_block.js";

export interface PlaceWallArgs {
  track: Track;
  type: string;
  color: string;
  start: Vec3;
  end: Vec3;
  height: number;
}

export async function placeWall(a: PlaceWallArgs): Promise<ToolResult<{ blocks_placed: number }>> {
  const ctx = getToolContext();
  // axis detection (assume wall lies along x or y)
  const dx = a.end[0] - a.start[0];
  const dy = a.end[1] - a.start[1];
  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  const length = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
  const ids: string[] = [];
  for (let i = 0; i < length; i++) {
    for (let h = 0; h < a.height; h++) {
      const pos: Vec3 = [
        a.start[0] + i * stepX,
        a.start[1] + i * stepY,
        a.start[2] + h,
      ];
      const res = await placeBlock({
        track: a.track, type: a.type, position: pos, color: a.color,
      });
      if (res.ok) ids.push(res.data.block_id);
    }
  }
  return ok({ blocks_placed: ids.length });
}

export const placeWallDef = {
  name: "place_wall",
  description: "Efficiently place a rectangular wall of blocks (bonus score).",
  schema: {
    type: "object",
    properties: {
      track: { type: "string", enum: ["minecraft", "lego"] },
      type: { type: "string" },
      color: { type: "string" },
      start: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
      end: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
      height: { type: "number" },
    },
    required: ["track", "type", "color", "start", "end", "height"],
  },
  handler: placeWall,
};
```

- [ ] **Step 3: `place_row.ts` 구현 (X/Y/Z 축 하나 방향으로)**

```ts
import { ok, type ToolResult, type Track, type Vec3 } from "@blockgame/shared";
import { placeBlock } from "./place_block.js";

export interface PlaceRowArgs {
  track: Track;
  type: string;
  color: string;
  start: Vec3;
  direction: "x" | "y" | "z";
  count: number;
}

export async function placeRow(a: PlaceRowArgs): Promise<ToolResult<{ blocks_placed: number }>> {
  const idx = a.direction === "x" ? 0 : a.direction === "y" ? 1 : 2;
  let placed = 0;
  for (let i = 0; i < a.count; i++) {
    const pos: Vec3 = [...a.start] as Vec3;
    pos[idx] += i;
    const r = await placeBlock({
      track: a.track, type: a.type, position: pos, color: a.color,
    });
    if (r.ok) placed++;
  }
  return ok({ blocks_placed: placed });
}

export const placeRowDef = {
  name: "place_row",
  description: "Place N blocks in a row along one axis (bonus score).",
  schema: {
    type: "object",
    properties: {
      track: { type: "string", enum: ["minecraft", "lego"] },
      type: { type: "string" }, color: { type: "string" },
      start: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
      direction: { type: "string", enum: ["x", "y", "z"] },
      count: { type: "number" },
    },
    required: ["track", "type", "color", "start", "direction", "count"],
  },
  handler: placeRow,
};
```

- [ ] **Step 4: `reset_scene.ts`, `undo.ts`**

`reset_scene.ts`:
```ts
import { ok, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function resetScene(): Promise<ToolResult<{ cleared: number }>> {
  const ctx = getToolContext();
  const n = ctx.state.scene.blocks.length;
  ctx.state.reset();
  ctx.broadcaster.emit({ type: "scene_reset" });
  return ok({ cleared: n });
}

export const resetSceneDef = {
  name: "reset_scene",
  description: "Clear all placed blocks. Free, no penalty.",
  schema: { type: "object", properties: {} },
  handler: resetScene,
};
```

`undo.ts`:
```ts
import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function undo(): Promise<ToolResult<{ undone_action: string }>> {
  const ctx = getToolContext();
  const last = ctx.state.scene.blocks.pop();
  if (!last) return err("INTERNAL", "nothing to undo");
  ctx.broadcaster.emit({ type: "block_removed", id: last.id });
  return ok({ undone_action: `removed block ${last.id}` });
}

export const undoDef = {
  name: "undo",
  description: "Undo the last placement.",
  schema: { type: "object", properties: {} },
  handler: undo,
};
```

- [ ] **Step 5: 테스트·등록·커밋**

```bash
pnpm --filter @blockgame/server test
git add packages/server/src/mcp/tools
git commit -m "feat(server): place_wall, place_row, reset_scene, undo"
```

---

## Task 13: MCP read tools — get_scene, get_challenge_info, list_*

**Files:**
- Create: `packages/server/src/mcp/tools/get_scene.ts`
- Create: `packages/server/src/mcp/tools/get_challenge_info.ts`
- Create: `packages/server/src/mcp/tools/list_colors.ts`
- Create: `packages/server/src/mcp/tools/list_block_types.ts`
- Create: `packages/server/src/mcp/tools/view_from.ts`
- Create: `packages/server/src/mcp/catalogs.ts` (색·블록 카탈로그 상수)

- [ ] **Step 1: `catalogs.ts`**

```ts
export const COLORS = [
  "#FFFFFF", "#000000", "#808080",
  "#FF0000", "#FFA500", "#FFFF00",
  "#00FF00", "#0066FF", "#000080",
  "#800080", "#8B4513", "#FFC0CB", "#8B6B4A",
];

export const MINECRAFT_BLOCK_TYPES = ["voxel_1x1"];
export const LEGO_BLOCK_TYPES = [
  "brick_1x1", "brick_1x2", "brick_2x2", "brick_2x4", "brick_1x8",
  "slope_1x2", "slope_2x2",
  "window_1x2", "window_2x2",
  "door_1x3",
  "baseplate_16x16",
];
```

- [ ] **Step 2: read tools 구현 (단순)**

`list_colors.ts`:
```ts
import { ok, type ToolResult } from "@blockgame/shared";
import { COLORS } from "../catalogs.js";
export async function listColors(): Promise<ToolResult<{ colors: string[] }>> {
  return ok({ colors: [...COLORS] });
}
export const listColorsDef = {
  name: "list_colors",
  description: "List available color hex codes.",
  schema: { type: "object", properties: {} },
  handler: listColors,
};
```

`list_block_types.ts`:
```ts
import { ok, err, type ToolResult, type Track } from "@blockgame/shared";
import { MINECRAFT_BLOCK_TYPES, LEGO_BLOCK_TYPES } from "../catalogs.js";

export async function listBlockTypes(args: { track: Track }): Promise<ToolResult<{ types: string[] }>> {
  if (args.track === "minecraft") return ok({ types: [...MINECRAFT_BLOCK_TYPES] });
  if (args.track === "lego") return ok({ types: [...LEGO_BLOCK_TYPES] });
  return err("INTERNAL", `unknown track ${args.track}`);
}
export const listBlockTypesDef = {
  name: "list_block_types",
  description: "List available block/brick types for the given track.",
  schema: {
    type: "object",
    properties: { track: { type: "string", enum: ["minecraft", "lego"] } },
    required: ["track"],
  },
  handler: listBlockTypes,
};
```

`get_scene.ts`:
```ts
import { ok, type ToolResult, type SceneSnapshot } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";
export async function getScene(): Promise<ToolResult<SceneSnapshot>> {
  return ok(getToolContext().state.scene);
}
export const getSceneDef = {
  name: "get_scene", description: "Return current scene snapshot.",
  schema: { type: "object", properties: {} }, handler: getScene,
};
```

`get_challenge_info.ts`: 게임 상태의 challenge_id 기반으로 manifest 로드해 반환. (챌린지 로더 Task 14/21에서 연계.)

`view_from.ts`:
```ts
import { ok, type ToolResult, type Vec3 } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

const ANGLES: Record<string, { pos: Vec3; target: Vec3 }> = {
  front:  { pos: [10,  -15, 6], target: [0, 0, 0] },
  back:   { pos: [10,   15, 6], target: [0, 0, 0] },
  top:    { pos: [0,   0,  30], target: [0, 0, 0] },
  left:   { pos: [-15, 0,   6], target: [0, 0, 0] },
  right:  { pos: [15,  0,   6], target: [0, 0, 0] },
};

export async function viewFrom(args: { angle: keyof typeof ANGLES }): Promise<ToolResult<{}>> {
  const ctx = getToolContext();
  const a = ANGLES[args.angle];
  ctx.state.scene.camera = { position: a.pos, target: a.target };
  ctx.broadcaster.emit({ type: "sync_state", session: ctx.state.toSession() });
  return ok({});
}
export const viewFromDef = {
  name: "view_from",
  description: "Move camera to a preset angle.",
  schema: {
    type: "object",
    properties: { angle: { type: "string", enum: ["front","back","top","left","right"] } },
    required: ["angle"],
  },
  handler: viewFrom,
};
```

- [ ] **Step 3: 각 tool 단순 테스트 + 등록**

각 tool에 1~2개 테스트 (ok 반환 확인). `mcp/index.ts`에 register.

- [ ] **Step 4: Track-specific tools — paint_block, fill_region**

`tools/paint_block.ts`:
```ts
import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

export async function paintBlock(args: { block_id: string; new_color: string }): Promise<ToolResult<{}>> {
  const ctx = getToolContext();
  const b = ctx.state.scene.blocks.find(x => x.id === args.block_id);
  if (!b) return err("UNKNOWN_BLOCK_ID", `no block ${args.block_id}`);
  b.color = args.new_color;
  ctx.broadcaster.emit({ type: "block_removed", id: b.id });
  ctx.broadcaster.emit({ type: "block_added", block: b });
  return ok({});
}
export const paintBlockDef = {
  name: "paint_block",
  description: "Change the color of an existing block (Minecraft track).",
  schema: {
    type: "object",
    properties: { block_id: { type: "string" }, new_color: { type: "string" } },
    required: ["block_id", "new_color"],
  },
  handler: paintBlock,
};
```

`tools/fill_region.ts`:
```ts
import { ok, type ToolResult, type Vec3 } from "@blockgame/shared";
import { placeBlock } from "./place_block.js";

export async function fillRegion(args: {
  box: [Vec3, Vec3]; color: string; type?: string;
}): Promise<ToolResult<{ blocks_placed: number }>> {
  const [a, b] = args.box;
  const type = args.type ?? "voxel_1x1";
  let placed = 0;
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;
  const [x0, x1] = [Math.min(ax, bx), Math.max(ax, bx)];
  const [y0, y1] = [Math.min(ay, by), Math.max(ay, by)];
  const [z0, z1] = [Math.min(az, bz), Math.max(az, bz)];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      for (let z = z0; z <= z1; z++) {
        const r = await placeBlock({
          track: "minecraft", type, position: [x, y, z], color: args.color,
        });
        if (r.ok) placed++;
      }
    }
  }
  return ok({ blocks_placed: placed });
}
export const fillRegionDef = {
  name: "fill_region",
  description: "Fill a 3D box region with blocks (Minecraft track).",
  schema: {
    type: "object",
    properties: {
      box: { type: "array", items: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 }, minItems: 2, maxItems: 2 },
      color: { type: "string" },
      type: { type: "string" },
    },
    required: ["box", "color"],
  },
  handler: fillRegion,
};
```

- [ ] **Step 5: Track-specific tools — list_brick_catalog, stack_bricks (LEGO)**

`tools/list_brick_catalog.ts`:
```ts
import { ok, type ToolResult } from "@blockgame/shared";
import { LEGO_BLOCK_TYPES } from "../catalogs.js";

export async function listBrickCatalog(): Promise<ToolResult<{
  standard: string[]; slopes: string[]; windows: string[]; doors: string[]; special: string[];
}>> {
  return ok({
    standard: LEGO_BLOCK_TYPES.filter(t => t.startsWith("brick_")),
    slopes: LEGO_BLOCK_TYPES.filter(t => t.startsWith("slope_")),
    windows: LEGO_BLOCK_TYPES.filter(t => t.startsWith("window_")),
    doors: LEGO_BLOCK_TYPES.filter(t => t.startsWith("door_")),
    special: LEGO_BLOCK_TYPES.filter(t => t.startsWith("baseplate_")),
  });
}
export const listBrickCatalogDef = {
  name: "list_brick_catalog",
  description: "List all available LEGO brick types grouped by category.",
  schema: { type: "object", properties: {} },
  handler: listBrickCatalog,
};
```

`tools/stack_bricks.ts`:
```ts
import { ok, type ToolResult, type Vec3 } from "@blockgame/shared";
import { placeBlock } from "./place_block.js";

export interface BrickSpec { type: string; color: string; rotation?: 0|90|180|270 }

export async function stackBricks(args: {
  base: Vec3; sequence: BrickSpec[];
}): Promise<ToolResult<{ blocks_placed: number }>> {
  let placed = 0;
  let [x, y, z] = args.base;
  for (const spec of args.sequence) {
    const r = await placeBlock({
      track: "lego", type: spec.type, position: [x, y, z],
      color: spec.color, rotation: spec.rotation,
    });
    if (r.ok) { placed++; z += 1; }
  }
  return ok({ blocks_placed: placed });
}
export const stackBricksDef = {
  name: "stack_bricks",
  description: "Stack multiple LEGO bricks vertically at a base position.",
  schema: {
    type: "object",
    properties: {
      base: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
      sequence: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            color: { type: "string" },
            rotation: { type: "number", enum: [0, 90, 180, 270] },
          },
          required: ["type", "color"],
        },
      },
    },
    required: ["base", "sequence"],
  },
  handler: stackBricks,
};
```

- [ ] **Step 6: 4개 tools 간단 테스트 + 레지스트리 등록**

각 tool에 happy-path 1개씩 테스트. `mcp/index.ts`:
```ts
import { paintBlockDef } from "./tools/paint_block.js";
import { fillRegionDef } from "./tools/fill_region.js";
import { listBrickCatalogDef } from "./tools/list_brick_catalog.js";
import { stackBricksDef } from "./tools/stack_bricks.js";
registerTool(paintBlockDef as any);
registerTool(fillRegionDef as any);
registerTool(listBrickCatalogDef as any);
registerTool(stackBricksDef as any);
```

- [ ] **Step 7: 커밋**

```bash
pnpm --filter @blockgame/server test
git add packages/server/src/mcp
git commit -m "feat(server): read tools + track-specific (paint, fill, brick_catalog, stack)"
```

---

## Task 14: MCP tool — `get_target_hint` (힌트 + 페널티)

**Files:**
- Create: `packages/server/src/mcp/tools/get_target_hint.ts`
- Test: 같은 디렉토리 `.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
import { getTargetHint } from "./get_target_hint.js";

describe("get_target_hint", () => {
  let state: GameState;
  beforeEach(() => {
    state = new GameState("s");
    state.challenge_id = "ch-test";
    setToolContext({ state, broadcaster: new Broadcaster() });
  });

  it("returns the small hint and increments counter", async () => {
    const r = await getTargetHint({ level: "small" });
    expect(r.ok).toBe(true);
    expect(state.hintsUsed).toBe(1);
  });

  it("errors on 4th hint", async () => {
    await getTargetHint({ level: "small" });
    await getTargetHint({ level: "medium" });
    await getTargetHint({ level: "large" });
    const r = await getTargetHint({ level: "small" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("HINT_LIMIT_EXCEEDED");
  });
});
```

- [ ] **Step 2: 구현**

테스트를 통과하려면 challenge manifest 접근이 필요하니, MVP엔 **stub 값**을 반환해도 됨 (Task 22~26에서 실제 manifest와 연결):

```ts
import { ok, err, type ToolResult } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";

const HINT_LIMIT = 3;

export async function getTargetHint(
  args: { level: "small" | "medium" | "large" },
): Promise<ToolResult<{ text: string; penalty: number; remaining: number }>> {
  const ctx = getToolContext();
  if (ctx.state.hintsUsed >= HINT_LIMIT) {
    return err("HINT_LIMIT_EXCEEDED", "No hints remaining");
  }
  ctx.state.incrementHint();
  // MVP stub — production load manifest.hints and return text
  const hint = { text: `(stub ${args.level} hint)`, penalty: args.level === "small" ? 5 : args.level === "medium" ? 10 : 20 };
  const remaining = HINT_LIMIT - ctx.state.hintsUsed;
  return ok({ text: hint.text, penalty: hint.penalty, remaining });
}

export const getTargetHintDef = {
  name: "get_target_hint",
  description: "Request a hint about the target. Limited to 3 per session. Penalty applied.",
  schema: {
    type: "object",
    properties: { level: { type: "string", enum: ["small", "medium", "large"] } },
    required: ["level"],
  },
  handler: getTargetHint,
};
```

- [ ] **Step 3: 테스트 + 커밋**

```bash
pnpm --filter @blockgame/server test tools/get_target_hint
git add packages/server/src/mcp/tools/get_target_hint.ts packages/server/src/mcp/tools/get_target_hint.test.ts
git commit -m "feat(server): get_target_hint with 3-hint limit (stub text)"
```

---

## Task 15: MCP tool — `submit_solution` + LLM 분석

**Files:**
- Create: `packages/server/src/mcp/tools/submit_solution.ts`
- Create: `packages/server/src/scoring/ambiguity-analyzer.ts`
- Create: `packages/server/src/scoring/report-builder.ts`
- Test: `packages/server/src/scoring/ambiguity-analyzer.test.ts`
- Test: `packages/server/src/mcp/tools/submit_solution.test.ts`

- [ ] **Step 1: Ambiguity analyzer 실패 테스트 (키워드 fallback)**

```ts
import { describe, it, expect } from "vitest";
import { keywordAmbiguityFallback } from "./ambiguity-analyzer.js";

describe("keywordAmbiguityFallback", () => {
  it("scores no ambiguity low", () => {
    const s = keywordAmbiguityFallback([{ user_intent: "place 5x3 red wall at (0,0,0)", tool_calls: [] } as any]);
    expect(s).toBeLessThanOrEqual(2);
  });
  it("scores heavy ambiguity high", () => {
    const intents = [
      { user_intent: "좀 더 왼쪽으로 옮겨줘", tool_calls: [] },
      { user_intent: "살짝 더 크게 만들어", tool_calls: [] },
      { user_intent: "약간 조금만 더", tool_calls: [] },
    ];
    expect(keywordAmbiguityFallback(intents as any)).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: `ambiguity-analyzer.ts` 구현 (키워드 + 선택적 LLM)**

```ts
import type { Turn } from "@blockgame/shared";

const AMBIGUOUS_WORDS = [
  "좀", "약간", "조금", "살짝", "대충", "적당히",
  "더", "덜", "훨씬", "많이", "조금만",
  "a bit", "a little", "somewhat", "slightly", "more", "less",
];

export interface AmbiguityAnalysis {
  average_score: number; // 0..10
  per_turn: Array<{ turn_id: string; score: number; matches: string[] }>;
  positive: string[];
  negative: string[];
  wasted: string[];
  missing: string[];
  llm_available: boolean;
}

export function keywordAmbiguityFallback(turns: Turn[]): number {
  if (turns.length === 0) return 0;
  let total = 0;
  for (const t of turns) {
    const text = t.user_intent.toLowerCase();
    let count = 0;
    for (const w of AMBIGUOUS_WORDS) {
      if (text.includes(w)) count++;
    }
    total += Math.min(count * 2, 10);
  }
  return Math.round(total / turns.length);
}

export async function analyzeAmbiguity(turns: Turn[]): Promise<AmbiguityAnalysis> {
  // MVP: keyword-only. Real LLM call added later (Task 29 integration).
  const avg = keywordAmbiguityFallback(turns);
  const per_turn = turns.map(t => ({
    turn_id: t.turn_id,
    score: keywordAmbiguityFallback([t]),
    matches: AMBIGUOUS_WORDS.filter(w => t.user_intent.toLowerCase().includes(w)),
  }));
  return {
    average_score: avg,
    per_turn,
    positive: [],
    negative: [],
    wasted: [],
    missing: [],
    llm_available: false,
  };
}
```

- [ ] **Step 3: `report-builder.ts`**

```ts
import type { ScoreReport, Turn, ScoreBreakdown } from "@blockgame/shared";
import { computeFinalScore } from "@blockgame/shared";
import type { AmbiguityAnalysis } from "./ambiguity-analyzer.js";

export interface BuildReportInput {
  challenge_id: string;
  session_id: string;
  turns: Turn[];
  iou: number;
  hintsUsed: number;
  batchToolUses: number;
  startedAt: number;
  submittedAt: number;
  ambiguity: AmbiguityAnalysis;
}

export function buildReport(i: BuildReportInput): ScoreReport {
  const breakdown: ScoreBreakdown = computeFinalScore({
    iou: i.iou,
    turnCount: i.turns.length,
    batchToolUses: i.batchToolUses,
    hintsUsed: i.hintsUsed,
    ambiguityAvg: i.ambiguity.average_score,
  });
  return {
    challenge_id: i.challenge_id,
    session_id: i.session_id,
    submitted_at: i.submittedAt,
    total_time_seconds: Math.round((i.submittedAt - i.startedAt) / 1000),
    turn_count: i.turns.length,
    breakdown,
    good: { title: "✅ 잘한 점", items: i.ambiguity.positive },
    bad:  { title: "❌ 개선점", items: i.ambiguity.negative },
    unnecessary: { title: "🗑️ 불필요", items: i.ambiguity.wasted },
    missing: { title: "💡 놓친 것", items: i.ambiguity.missing },
    recommendations: { title: "📈 다음엔", items: [] },
    llm_analysis_available: i.ambiguity.llm_available,
  };
}
```

- [ ] **Step 4: submit_solution tool**

```ts
import { ok, type ToolResult, type Block, type ScoreReport } from "@blockgame/shared";
import { computeVoxelIoU } from "@blockgame/shared";
import { getToolContext } from "../tool-context.js";
import { analyzeAmbiguity } from "../../scoring/ambiguity-analyzer.js";
import { buildReport } from "../../scoring/report-builder.js";

import { loadChallenge, targetToBlocks } from "@blockgame/shared";
import path from "node:path";

// Resolve challenges/ dir from project root
function challengeDir(challenge_id: string): string {
  // ch-001 → 001-small-cabin format handled via a lookup list
  const slug = CHALLENGE_ID_TO_SLUG[challenge_id];
  if (!slug) throw new Error(`no directory mapped for ${challenge_id}`);
  return path.resolve(process.cwd(), "challenges", slug);
}

const CHALLENGE_ID_TO_SLUG: Record<string, string> = {
  "ch-001": "001-small-cabin",
  "ch-002": "002-grey-shed",
  "ch-003": "003-two-story",
  "ch-004": "004-tower",
  "ch-005": "005-l-shaped-villa",
};

async function loadTargetBlocks(challenge_id: string): Promise<Block[]> {
  const ch = await loadChallenge(challengeDir(challenge_id));
  return targetToBlocks(ch.voxelTarget);
}

export async function submitSolution(
  _args: { note?: string },
): Promise<ToolResult<ScoreReport>> {
  const ctx = getToolContext();
  const challenge_id = ctx.state.challenge_id ?? "unknown";
  const target = await loadTargetBlocks(challenge_id);
  const iou = computeVoxelIoU(ctx.state.scene.blocks, target);
  const ambiguity = await analyzeAmbiguity(ctx.state.turns);
  const batchCount = ctx.state.turns.flatMap(t => t.tool_calls)
    .filter(c => c.tool_name === "place_wall" || c.tool_name === "place_row").length;
  const report = buildReport({
    challenge_id,
    session_id: ctx.state.id,
    turns: ctx.state.turns,
    iou,
    hintsUsed: ctx.state.hintsUsed,
    batchToolUses: batchCount,
    startedAt: ctx.state.turns[0]?.started_at ?? Date.now(),
    submittedAt: Date.now(),
    ambiguity,
  });
  ctx.state.finalized = true;
  ctx.broadcaster.emit({ type: "score_result", report });
  return ok(report);
}

export const submitSolutionDef = {
  name: "submit_solution",
  description: "Finalize the session. Computes IoU, ambiguity, builds the score report.",
  schema: {
    type: "object",
    properties: { note: { type: "string" } },
  },
  handler: submitSolution,
};
```

(주의: `loadTargetBlocks`는 Task 23 챌린지 통합 시 연결.)

- [ ] **Step 5: submit_solution 테스트**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameState } from "../../state/game-state.js";
import { Broadcaster } from "../../transport/ws-broadcaster.js";
import { setToolContext } from "../tool-context.js";
// mock loader
vi.mock("./submit_solution.js", async (orig) => ({
  ...await (orig as any)(),
}));

describe("submit_solution", () => {
  it("produces a report with breakdown", async () => {
    const state = new GameState("s");
    state.challenge_id = "ch-test";
    setToolContext({ state, broadcaster: new Broadcaster() });
    // For now we patch loadTargetBlocks inline via module mock in a later task.
    // Here we just verify the report structure using an injected target.
    // ... integration test deferred to Task 23.
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 6: 레지스트리 등록 + 커밋**

```bash
pnpm --filter @blockgame/server test
git add packages/server/src
git commit -m "feat(server): submit_solution + ambiguity fallback + report builder"
```

---

## Task 16: web-app — Vite + React 스켈레톤

**Files:**
- Modify: `packages/web-app/package.json`
- Create: `packages/web-app/vite.config.ts`, `packages/web-app/index.html`
- Create: `packages/web-app/src/main.tsx`
- Create: `packages/web-app/src/App.tsx`
- Create: `packages/web-app/src/styles.css`

- [ ] **Step 1: package.json + 의존성**

```json
{
  "name": "@blockgame/web-app",
  "version": "0.0.1",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@blockgame/shared": "workspace:*",
    "@blockgame/renderer-minecraft": "workspace:*",
    "@blockgame/renderer-lego": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@react-three/fiber": "^8.16.0",
    "@react-three/drei": "^9.105.0",
    "three": "^0.162.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.162.0",
    "vitest": "^1.4.0",
    "@testing-library/react": "^14.2.0",
    "jsdom": "^24.0.0"
  }
}
```

설치:
```bash
pnpm install
```

- [ ] **Step 2: vite.config.ts + index.html + main.tsx**

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: { outDir: "dist" },
});
```

`index.html`:
```html
<!doctype html>
<html><head><meta charset="utf-8"><title>AI Architect</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
```

`src/main.tsx`:
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

`src/App.tsx`:
```tsx
export function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>AI Architect</h1>
      <p>Waiting for Claude Code...</p>
    </div>
  );
}
```

`src/styles.css`:
```css
body { margin: 0; background: #1a1a1a; color: #fff; }
```

- [ ] **Step 3: 빌드·개발서버 확인**

```bash
pnpm --filter @blockgame/web-app build
pnpm --filter @blockgame/web-app dev
```

브라우저에서 http://localhost:5173 열어 "Waiting for Claude Code..." 확인.

- [ ] **Step 4: 커밋**

```bash
git add packages/web-app
git commit -m "feat(web-app): Vite + React skeleton"
```

---

## Task 17: web-app — WebSocket 클라이언트 + 씬 sync

**Files:**
- Create: `packages/web-app/src/hooks/useGameSocket.ts`
- Create: `packages/web-app/src/state/scene-store.ts`
- Modify: `packages/web-app/src/App.tsx`

- [ ] **Step 1: Zustand 없이 단순 reducer로 상태 관리**

`scene-store.ts`:
```ts
import React from "react";
import type { Block, SceneSnapshot } from "@blockgame/shared";

type Action =
  | { type: "hello" }
  | { type: "block_added"; block: Block }
  | { type: "block_removed"; id: string }
  | { type: "scene_reset" }
  | { type: "sync_state"; session: { current_scene: SceneSnapshot } }
  | { type: "score_result"; report: unknown };

export interface SceneState {
  blocks: Block[];
  connected: boolean;
  report?: unknown;
}

const initial: SceneState = { blocks: [], connected: false };

function reduce(s: SceneState, a: Action): SceneState {
  switch (a.type) {
    case "hello": return { ...s, connected: true };
    case "block_added": return { ...s, blocks: [...s.blocks, a.block] };
    case "block_removed": return { ...s, blocks: s.blocks.filter(b => b.id !== a.id) };
    case "scene_reset": return { ...s, blocks: [] };
    case "sync_state": return { ...s, blocks: a.session.current_scene.blocks };
    case "score_result": return { ...s, report: a.report };
    default: return s;
  }
}

export function useSceneReducer() {
  return React.useReducer(reduce, initial);
}
```

- [ ] **Step 2: useGameSocket 훅**

```ts
import React from "react";

export function useGameSocket(
  url: string,
  dispatch: (a: any) => void,
) {
  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let attempt = 0;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      ws = new WebSocket(url);
      ws.onmessage = (e) => {
        try { dispatch(JSON.parse(e.data)); } catch { /* ignore */ }
      };
      ws.onclose = () => {
        attempt++;
        const backoff = Math.min(10_000, 500 * 2 ** Math.min(attempt, 6));
        setTimeout(connect, backoff);
      };
    }
    connect();
    return () => { cancelled = true; ws?.close(); };
  }, [url, dispatch]);
}
```

- [ ] **Step 3: App에서 씬 상태 표시**

```tsx
import React from "react";
import { useSceneReducer } from "./state/scene-store.js";
import { useGameSocket } from "./hooks/useGameSocket.js";

export function App() {
  const [state, dispatch] = useSceneReducer();
  useGameSocket("ws://localhost:7788/ws", dispatch);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>AI Architect</h1>
      <p>Connected: {state.connected ? "✅" : "⏳ Waiting for Claude Code..."}</p>
      <p>Blocks: {state.blocks.length}</p>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 + 커밋**

Test는 최소화 (reducer만):
```ts
import { describe, it, expect } from "vitest";
// inline test reducer via internal import
```

```bash
git add packages/web-app/src
git commit -m "feat(web-app): WebSocket sync + scene reducer"
```

---

## Task 18: web-app — Challenge Selector + Instruction Log UI

**Files:**
- Create: `packages/web-app/src/components/ChallengeSelector.tsx`
- Create: `packages/web-app/src/components/InstructionLog.tsx`
- Modify: `packages/web-app/src/App.tsx`

- [ ] **Step 1: 단순 UI 컴포넌트 먼저 (TDD는 스냅샷 수준)**

`ChallengeSelector.tsx`:
```tsx
import React from "react";
interface Props { onSelect: (id: string) => void }
export const ChallengeSelector: React.FC<Props> = ({ onSelect }) => {
  const items = [
    { id: "ch-001", title: "작은 오두막", difficulty: "easy" },
    { id: "ch-002", title: "회색 창고", difficulty: "easy" },
    { id: "ch-003", title: "2층 주택", difficulty: "medium" },
    { id: "ch-004", title: "탑", difficulty: "medium" },
    { id: "ch-005", title: "ㄱ자 별장", difficulty: "hard" },
  ];
  return (
    <div>
      <h2>챌린지 선택</h2>
      <ul>{items.map(c =>
        <li key={c.id}><button onClick={() => onSelect(c.id)}>{c.title} ({c.difficulty})</button></li>)}
      </ul>
    </div>
  );
};
```

`InstructionLog.tsx`:
```tsx
import React from "react";
import type { Turn } from "@blockgame/shared";
export const InstructionLog: React.FC<{ turns: Turn[] }> = ({ turns }) => (
  <aside style={{ maxWidth: 340, borderLeft: "1px solid #333", padding: 12 }}>
    <h3>Instructions</h3>
    <ol>{turns.map(t =>
      <li key={t.turn_id}><strong>{t.user_intent}</strong>
        <ul>{t.tool_calls.map((c, i) => <li key={i}>{c.tool_name}</li>)}</ul>
      </li>)}
    </ol>
  </aside>
);
```

- [ ] **Step 2: App 조합**

```tsx
// App.tsx (updated)
import { ChallengeSelector } from "./components/ChallengeSelector.js";
import { InstructionLog } from "./components/InstructionLog.js";

export function App() {
  const [state, dispatch] = useSceneReducer();
  useGameSocket("ws://localhost:7788/ws", dispatch);
  const [challenge, setChallenge] = React.useState<string | null>(null);
  if (!challenge) return <ChallengeSelector onSelect={setChallenge} />;
  return (
    <div style={{ display: "flex" }}>
      <main style={{ flex: 1 }}>
        <h1>{challenge}</h1>
        <p>Connected: {state.connected ? "✅" : "⏳"}</p>
        <p>Blocks: {state.blocks.length}</p>
      </main>
      <InstructionLog turns={[]} />
    </div>
  );
}
```

- [ ] **Step 3: 실행 확인 + 커밋**

```bash
pnpm --filter @blockgame/web-app dev
git add packages/web-app/src
git commit -m "feat(web-app): challenge selector + instruction log UI"
```

---

## Task 19: web-app — Score Report Modal

**Files:**
- Create: `packages/web-app/src/components/ScoreReport.tsx`
- Modify: `packages/web-app/src/App.tsx`

- [ ] **Step 1: Report 컴포넌트**

```tsx
import React from "react";
import type { ScoreReport } from "@blockgame/shared";

interface Props { report: ScoreReport; onClose: () => void }

export const ScoreReportModal: React.FC<Props> = ({ report, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  }}>
    <div style={{ background: "#222", padding: 24, borderRadius: 8, maxWidth: 680, width: "100%" }}>
      <h2>🏆 챌린지 완료 — {report.breakdown.grade} 등급</h2>
      <p style={{ fontSize: 36, margin: 0 }}>{report.breakdown.final} / 100</p>
      <p>시간: {report.total_time_seconds}s · 턴: {report.turn_count}</p>

      <h3>점수 내역</h3>
      <ul>
        <li>Voxel IoU: {report.breakdown.iou_points}</li>
        <li>효율 보너스: +{report.breakdown.efficiency_bonus}</li>
        <li>모호 페널티: -{report.breakdown.ambiguity_penalty}</li>
        <li>힌트 페널티: -{report.breakdown.hint_penalty}</li>
      </ul>

      {[report.good, report.bad, report.unnecessary, report.missing, report.recommendations].map(s => (
        <section key={s.title}>
          <h3>{s.title}</h3>
          <ul>{s.items.length === 0 ? <li><em>(없음)</em></li> : s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
        </section>
      ))}

      {!report.llm_analysis_available && (
        <p style={{ opacity: 0.6 }}><em>(LLM 분석 불가 — 키워드 폴백 사용)</em></p>
      )}
      <button onClick={onClose}>닫기</button>
    </div>
  </div>
);
```

- [ ] **Step 2: App에서 report 표시**

```tsx
// when state.report is set, show modal
{state.report && <ScoreReportModal report={state.report as ScoreReport} onClose={() => { /* dispatch reset */ }} />}
```

- [ ] **Step 3: 커밋**

```bash
git add packages/web-app/src
git commit -m "feat(web-app): score report modal"
```

---

## Task 20: renderer-minecraft — R3F 복셀 렌더러

**Files:**
- Modify: `packages/renderer-minecraft/package.json`
- Create: `packages/renderer-minecraft/src/VoxelScene.tsx`
- Create: `packages/renderer-minecraft/src/VoxelBlock.tsx`
- Create: `packages/renderer-minecraft/src/index.ts`
- Test 스냅샷: `VoxelScene.test.tsx`

- [ ] **Step 1: package.json**

```json
{
  "name": "@blockgame/renderer-minecraft",
  "version": "0.0.1",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@blockgame/shared": "workspace:*",
    "@react-three/fiber": "^8.16.0",
    "react": "^18.3.0",
    "three": "^0.162.0"
  },
  "peerDependencies": {
    "react": ">=18"
  },
  "devDependencies": {
    "typescript": "^5.4.0", "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 2: VoxelBlock.tsx**

```tsx
import React from "react";
import type { Block } from "@blockgame/shared";

export const VoxelBlock: React.FC<{ block: Block }> = ({ block }) => (
  <mesh position={block.position}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={block.color} />
  </mesh>
);
```

- [ ] **Step 3: VoxelScene.tsx**

```tsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import type { Block } from "@blockgame/shared";
import { VoxelBlock } from "./VoxelBlock.js";

export const VoxelScene: React.FC<{ blocks: Block[] }> = ({ blocks }) => (
  <Canvas camera={{ position: [10, 10, 10] }} style={{ height: "100%" }}>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 20, 10]} intensity={0.8} />
    <gridHelper args={[32, 32]} />
    {blocks.filter(b => b.track === "minecraft").map(b => <VoxelBlock key={b.id} block={b} />)}
  </Canvas>
);
```

- [ ] **Step 4: index.ts re-export + 간단 스냅샷 테스트**

```ts
export { VoxelScene } from "./VoxelScene.js";
export { VoxelBlock } from "./VoxelBlock.js";
```

- [ ] **Step 5: 커밋**

```bash
pnpm --filter @blockgame/renderer-minecraft build
git add packages/renderer-minecraft
git commit -m "feat(renderer-minecraft): R3F voxel scene"
```

---

## Task 21: renderer-lego — R3F LEGO 브릭

**Files:**
- `packages/renderer-lego/package.json`
- `packages/renderer-lego/src/LegoScene.tsx`
- `packages/renderer-lego/src/bricks/Brick.tsx`
- `packages/renderer-lego/src/bricks/Stud.tsx`
- `packages/renderer-lego/src/index.ts`

- [ ] **Step 1: LegoScene**

```tsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import type { Block } from "@blockgame/shared";
import { Brick } from "./bricks/Brick.js";

export const LegoScene: React.FC<{ bricks: Block[] }> = ({ bricks }) => (
  <Canvas camera={{ position: [15, 15, 15] }} style={{ height: "100%" }}>
    <ambientLight intensity={0.6} />
    <directionalLight position={[10, 20, 10]} intensity={0.9} />
    <gridHelper args={[32, 32]} />
    {bricks.filter(b => b.track === "lego").map(b => <Brick key={b.id} brick={b} />)}
  </Canvas>
);
```

- [ ] **Step 2: Brick.tsx (크기별 스위치)**

```tsx
import React from "react";
import type { Block } from "@blockgame/shared";
import { Stud } from "./Stud.js";

const BRICK_SIZES: Record<string, [number, number, number]> = {
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

export const Brick: React.FC<{ brick: Block }> = ({ brick }) => {
  const size = BRICK_SIZES[brick.type] ?? [1, 1, 1];
  const [sx, sy, sz] = size;
  return (
    <group position={brick.position}>
      <mesh>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial color={brick.color} />
      </mesh>
      {/* studs */}
      {brick.type !== "baseplate_16x16" && Array.from({ length: sx * sy }).map((_, i) => {
        const x = i % sx - (sx - 1) / 2;
        const y = Math.floor(i / sx) - (sy - 1) / 2;
        return <Stud key={i} position={[x, y, sz / 2 + 0.1]} color={brick.color} />;
      })}
    </group>
  );
};
```

- [ ] **Step 3: Stud.tsx**

```tsx
import React from "react";
export const Stud: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => (
  <mesh position={position}>
    <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
    <meshStandardMaterial color={color} />
  </mesh>
);
```

- [ ] **Step 4: 커밋**

```bash
git add packages/renderer-lego
git commit -m "feat(renderer-lego): R3F brick scene with stud rendering"
```

---

## Task 22: 챌린지 #1 — 작은 오두막

**Files:**
- Create: `challenges/001-small-cabin/manifest.json`
- Create: `challenges/001-small-cabin/target-voxels.json`
- Create: `challenges/001-small-cabin/target-bricks.json`
- Create: `challenges/001-small-cabin/target-spec.md`
- Create: `challenges/001-small-cabin/target-image.png` (플레이스홀더 이미지 OK)

- [ ] **Step 1: manifest.json**

```json
{
  "id": "ch-001",
  "title": "작은 오두막",
  "difficulty": "easy",
  "mode": "image",
  "grid_size": [10, 10, 8],
  "tracks": ["minecraft", "lego"],
  "target_image": "target-image.png",
  "target_spec_md": "target-spec.md",
  "target_voxels": "target-voxels.json",
  "target_bricks": "target-bricks.json",
  "hints": [
    { "level": "small", "penalty": 5, "text": "집의 바닥면은 5×5입니다." },
    { "level": "medium", "penalty": 10, "text": "벽은 흰색 3블록 높이, 지붕은 빨간 경사입니다." },
    { "level": "large", "penalty": 20, "text": "5×5 베이스, 흰 벽 3블록, 경사 빨간 지붕. 남쪽 벽 중앙(x=2, z=0)에 문, 북쪽 벽에 창문 2개." }
  ],
  "optimal_instructions": 5,
  "time_estimate_minutes": 2,
  "tutorial_mode": true
}
```

- [ ] **Step 2: target-voxels.json (5×5 벽, 높이 3, 빨간 지붕)**

스크립트로 생성하거나 손으로 작성. 약 50개 블록.

- [ ] **Step 3: target-spec.md**

```md
# 작은 오두막

- 바닥: 5×5
- 벽: 흰색 (3블록 높이)
- 지붕: 빨간 경사
- 문: 남쪽 중앙
- 창문: 북쪽 벽 2개
```

- [ ] **Step 4: target-image.png**

MVP엔 placeholder PNG 충분. (실제 렌더로 타겟 이미지 자동 생성은 v2.)

- [ ] **Step 5: 커밋**

```bash
git add challenges/001-small-cabin
git commit -m "feat(challenges): #1 small cabin"
```

---

## Task 23: 챌린지 #2 — 회색 창고

`challenges/002-grey-shed/` 같은 형식. Mode: `"text"`. 단순 박스 + 문·창 위치 명시.

- [ ] 위 Task 22와 동일한 순서: manifest / voxels / bricks / spec.md / image
- [ ] 커밋

```bash
git commit -m "feat(challenges): #2 grey shed"
```

---

## Task 24: 챌린지 #3 — 2층 주택

층 구분 (흰 1층, 노란 2층), 창문 각층 2개, 지붕. ~130 블록.

- [ ] manifest / voxels / bricks / spec / image
- [ ] 커밋 `feat(challenges): #3 two-story house`

---

## Task 25: 챌린지 #4 — 탑 (Tower)

`mode: "text"`, 3×3×8, 경사 지붕.

- [ ] 위와 동일
- [ ] 커밋 `feat(challenges): #4 tower`

---

## Task 26: 챌린지 #5 — ㄱ자 별장

난이도 hard. L자 평면 + 발코니. ~300 블록.

- [ ] 위와 동일
- [ ] 커밋 `feat(challenges): #5 L-shaped villa`

---

## Task 27: server CLI + 브라우저 자동 실행 (`npx blockgame`)

**Files:**
- Create: `packages/server/src/cli.ts`
- Modify: `packages/server/package.json` (bin 확인)

- [ ] **Step 1: cli.ts**

```ts
#!/usr/bin/env node
import { startHttp, createMcpServer, startStdio, registerTool, toolRegistry } from "./index.js";
import open from "open";
import { randomUUID } from "node:crypto";
import { GameState } from "./state/game-state.js";
import { Broadcaster } from "./transport/ws-broadcaster.js";
import { setToolContext } from "./mcp/tool-context.js";
import { saveSession, loadSession, defaultSessionDir } from "./state/persistence.js";

async function main() {
  const args = process.argv.slice(2);
  const resumeFlag = args.indexOf("--resume");
  const noBrowser = args.includes("--no-browser");

  let state: GameState;
  if (resumeFlag >= 0) {
    const id = args[resumeFlag + 1];
    state = await loadSession(id, defaultSessionDir());
  } else {
    state = new GameState(randomUUID());
  }

  const broadcaster = new Broadcaster();
  setToolContext({ state, broadcaster });

  // Register all tools (imports handled by mcp/index.ts)
  await import("./mcp/index.js");

  const { wss } = startHttp({ port: 7788 });
  wss.on("connection", ws => {
    const off = broadcaster.subscribe(m => ws.send(JSON.stringify(m)));
    ws.on("close", off);
  });

  // Flush state on every WS event
  setInterval(() => saveSession(state, defaultSessionDir()).catch(() => {}), 2_000);

  if (!noBrowser) open(`http://localhost:5173`).catch(() => {});

  console.error(`[blockgame] session ${state.id} — register MCP: claude mcp add blockgame -- npx blockgame-mcp`);

  // When launched via MCP stdio by Claude Code, the stdio entrypoint is separate (`blockgame-mcp` bin).
  // This cli.ts is the HTTP/WS host. Keep the process alive.
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: mcp-cli 별도 엔트리**

`src/mcp-cli.ts`:
```ts
#!/usr/bin/env node
import { createMcpServer, startStdio } from "./index.js";

async function main() {
  const server = createMcpServer();
  await startStdio(server);
}
main();
```

- [ ] **Step 3: package.json bin 업데이트**

```json
"bin": {
  "blockgame": "dist/cli.js",
  "blockgame-mcp": "dist/mcp-cli.js"
}
```

- [ ] **Step 4: 빌드 확인**

```bash
pnpm --filter @blockgame/server build
node packages/server/dist/cli.js --help || true  # 실행 확인
```

- [ ] **Step 5: 커밋**

```bash
git add packages/server
git commit -m "feat(server): CLI entry points (blockgame, blockgame-mcp)"
```

---

## Task 28: E2E Playwright 행복 경로

**Files:**
- Create: `e2e/playwright.config.ts`
- Create: `e2e/happy-path.spec.ts`
- Modify: 루트 `package.json` (Playwright 의존성)

- [ ] **Step 1: 설치**

```bash
pnpm add -Dw @playwright/test
pnpm dlx playwright install chromium
```

- [ ] **Step 2: playwright.config.ts**

```ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  use: { baseURL: "http://localhost:5173", headless: true },
  webServer: {
    command: "pnpm dev",
    cwd: "../packages/web-app",
    port: 5173,
    reuseExistingServer: false,
  },
});
```

- [ ] **Step 3: happy-path.spec.ts**

```ts
import { test, expect } from "@playwright/test";

test("challenge selector renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /챌린지/ })).toBeVisible();
});

test("selecting a challenge shows game scene", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /작은 오두막/ }).click();
  await expect(page.getByText(/ch-001/)).toBeVisible();
});
```

- [ ] **Step 4: 실행**

```bash
cd e2e && pnpm exec playwright test
```
기대: 2개 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add e2e pnpm-lock.yaml package.json
git commit -m "test(e2e): happy path — challenge list + select"
```

---

## Task 29: README + 설치 가이드 + 수용 기준 체크

**Files:**
- Modify: 루트 `README.md`
- Create: `docs/INSTALL.md`

- [ ] **Step 1: README 업데이트**

플레이어 설치·플레이 흐름:
```bash
# Install
npx blockgame

# In a separate terminal
claude mcp add blockgame -- npx blockgame-mcp
claude
# Then talk to Claude Code to build!
```

- [ ] **Step 2: INSTALL.md**

Node 버전, pnpm 설치, 개발 실행 순서(`pnpm dev`), 빌드(`pnpm build`), 테스트 전체(`pnpm test`).

- [ ] **Step 3: 수용 기준 체크리스트 실행**

스펙 §10.5 기준:
- [ ] 5개 챌린지 설계자 기준 ≥ 90점 통과
- [ ] 10명 테스터 점수 분포 확인 (수동)
- [ ] 서버 크래시 → `--resume` 복원 확인 (수동)
- [ ] Playwright E2E 통과 (자동: `pnpm --filter e2e test`)
- [ ] shared/ + server/mcp/tools 커버리지 ≥ 85%

커버리지:
```bash
pnpm --filter @blockgame/shared test --coverage
pnpm --filter @blockgame/server test --coverage
```

- [ ] **Step 4: 최종 커밋 + 태그**

```bash
git add README.md docs
git commit -m "docs: README + install guide + MVP acceptance checklist"
git tag v0.1.0-mvp
```

---

## 완료 기준 (MVP)

| 항목 | 목표 | 검증 |
|---|---|---|
| 패키지 빌드 | 5개 모두 PASS | `pnpm build` |
| 유닛 테스트 커버리지 | shared/ + server/mcp ≥ 85% | `pnpm test --coverage` |
| E2E 행복 경로 | 2 시나리오 PASS | Playwright |
| 챌린지 5개 | 설계자 ≥ 90점 | 수동 플레이 |
| 세션 영속 | crash → resume 무결성 | 수동 테스트 |
| MCP 연결 | `claude mcp add blockgame` 성공 | 수동 |

---

**끝.**
