# AI Architect — Design Specification

> **"레고·마인크래프트로 집을 지으면서 AI 커뮤니케이션 스킬을 측정·훈련하는 게임"**

---

## 1. Purpose & Goals

### 1.1 What we're building

**AI Architect** — a web-based building game where players instruct a local Claude Code instance (via MCP) to construct LEGO/Minecraft-style houses matching a target. Scoring measures how clearly the player communicates — rewarding specificity, penalizing ambiguity, and generating a detailed post-game report.

### 1.2 Positioning (Hybrid)

Three intended modes, phased delivery:

1. **🎓 Education** — players train AI-communication skills through challenges with detailed feedback
2. **📊 Assessment** — standardized scenarios produce objective scores for interviews/hiring
3. **🎮 Entertainment** — leaderboards, daily challenges, shareable reports

**MVP focuses on Education** (with assessment/entertainment as direct extensions of the same engine).

### 1.3 MVP scope

- **5 challenges** with difficulty curve (2 easy / 2 medium / 1 hard)
- **2 rendering tracks**: Minecraft voxel + LEGO brick (shared engine, pluggable renderers)
- **Local Claude Code** as the sole AI engine (no external API costs)
- **Single-channel input**: Claude Code terminal is the only place players type; browser is read-only
- **Voxel IoU scoring** + **LLM-analyzed ambiguity report** (detailed post-game feedback)
- **Target delivery**: 4–5 weeks

### 1.4 Success criteria

- All 5 challenges are solvable by the designer with high quality in ≤5 instructions
- 10 playtesters produce score distributions between 30 and 95 (meaningful spread)
- The ambiguity penalty correctly distinguishes top-quartile players from bottom-half
- Zero session loss on server crash or terminal disconnect
- 85%+ unit-test coverage on MCP tools and scorer

---

## 2. System Architecture

### 2.1 Overview

```
┌─────────────────┐        ┌────────────────────────┐
│  Claude Code    │        │  Player                │
│  (user terminal)│◄──chat─│  (Browser, read-only)  │
└────────┬────────┘        └──────────▲─────────────┘
         │                            │
         │ MCP stdio                  │ WebSocket
         ▼                            │
┌──────────────────────────────────────────────────┐
│  @blockgame/server (local process, `npx`)        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ MCP Router │──│ Game State │──│ WebSocket  │  │
│  │ (17+ tools)│  │ (scene, log)│ │ (live sync)│  │
│  └────────────┘  └────────────┘  └────────────┘  │
│         │              │                         │
│         ▼              ▼                         │
│  ┌────────────┐  ┌────────────┐                  │
│  │ Challenges │  │ Scorer     │                  │
│  │ (JSON lib) │  │ (IoU + LLM)│                  │
│  └────────────┘  └────────────┘                  │
└──────────────────────────────────────────────────┘
```

### 2.2 Input-channel policy

- **Claude Code is the only input channel.** The browser is strictly read-only: it shows the 3D scene, target image, instruction log, and score report.
- Rationale: avoids `claude -p` piping, session-continuity complexity, and two-way sync issues.
- All player-typed prompts are captured via a required `record_user_intent` tool call before any build tool is accepted.

### 2.3 Session continuity

- Session state is persisted to `~/.blockgame/sessions/<id>.json` after every tool call.
- `npx blockgame --resume <id>` fully restores scene, logs, and target.
- WebSocket reconnects on drop with exponential backoff; server queues missed events.
- MCP stdio reconnection is transparent — Claude Code reconnecting picks up the same session.

---

## 3. Packages (Monorepo)

```
blockgame/ (pnpm workspace)
│
├─ packages/
│  ├─ shared/                  — types, challenge loader, scorer
│  ├─ server/                  — MCP tools + Express + WebSocket (npx entry)
│  ├─ web-app/                 — React UI, track switcher
│  ├─ renderer-minecraft/      — R3F voxel renderer
│  └─ renderer-lego/           — R3F LEGO brick renderer
│
├─ challenges/                 — challenge data (5 directories)
├─ pnpm-workspace.yaml
└─ README.md
```

**Dependency direction**:
```
server, web-app, renderer-*  →  shared
web-app                      →  renderer-minecraft, renderer-lego
```

**Rationale**:
- `shared` guarantees type parity between server and frontend.
- `server` can run without browser (`--no-browser` flag) for CI or assessment scenarios.
- Renderers are pluggable — adding a third track (e.g., low-poly architecture) is a new package without touching existing code.

---

## 4. Data Flow — One Round

```
1. Player runs `npx blockgame`
   → server starts, browser auto-opens.

2. Player registers MCP: `claude mcp add blockgame ...`

3. Player selects a challenge in the browser UI.
   → server loads target; browser renders target image; scene resets.

4. Player instructs Claude Code: "build a 2-story red-roof house".
   → Claude Code calls `record_user_intent("build a 2-story red-roof house")`
   → then calls `place_wall(...)`, `place_block(...)`, etc.
   → server updates game state, pushes each block via WebSocket.
   → browser renders blocks in real time.

5. Player iterates based on visual feedback: "no, put the door on the east wall".
   → new `record_user_intent` call begins a new turn.
   → tool calls continue.

6. Player finalizes: "done, score it" → `submit_solution()` tool call.
   → server runs voxel IoU.
   → server batches all turns to LLM for ambiguity analysis.
   → score report generated, pushed to browser as modal.

7. Player reviews report, sees what was good / bad / unnecessary / missing / recommended.
```

### 4.1 Turn-boundary rules

- A **turn** starts when `record_user_intent` is called.
- Every subsequent build tool is attributed to that turn.
- `record_user_intent` is required once per turn; if `place_*` is invoked without a recent intent (<30 s), the tool returns `INTENT_NOT_LOGGED` and asks Claude Code to call `record_user_intent` first.
- This guarantees we capture the original prompt text for every action.

---

## 5. MCP Tool Interface

### 5.1 Common tools (shared across tracks)

**Read (free):**
- `get_challenge_info()` — challenge metadata + target image URL / target spec text
- `get_scene()` — current blocks + camera state
- `list_colors()` — available colors
- `list_block_types(track)` — available block/brick types for the active track
- `get_target_hint(level: small|medium|large)` — **limited to 3 calls per session**; penalties -5 / -10 / -20

**Write (scene mutations):**
- `record_user_intent(text, turn_id?)` — **required** before build tools
- `place_block({ track, type, position, rotation?, color })`
- `remove_block(block_id)`
- `remove_blocks_in_region(box)`
- `move_block(block_id, new_position)`
- `place_wall({ track, type, color, start, end, height })`
- `place_row({ track, type, color, start, direction, count })`
- `reset_scene()`
- `undo()`

**Camera:**
- `view_from(angle: front|back|top|left|right)`

**Completion:**
- `submit_solution(note?)` — triggers scoring, returns full report

### 5.2 Track-specific tools

**Minecraft**:
- `paint_block(block_id, new_color)`
- `fill_region(box, color, pattern?)`

**LEGO**:
- `list_brick_catalog()` — 10–12 brick types
- `stack_bricks(base, sequence)`

### 5.3 Tool design principles

- **Execute-what-you're-told**: tools don't refuse ambiguous input. If the player's Claude Code passes something underspecified, the game places what it received — the subsequent visual mismatch is the signal, not a tool-level error.
- **Structured results**: `{ ok: true, data }` or `{ ok: false, error: { code, message, hint? } }`. Never throw across the MCP boundary.
- **Batch-friendly**: `place_wall` / `place_row` enable efficiency bonuses and let Claude Code express intent compactly.
- **Undo is free**: mistakes have no lasting cost, encouraging exploration.

### 5.4 Instruction log (auto-captured)

Every tool call records:

```ts
interface ToolCallLog {
  timestamp: number;
  turn_id: string;
  user_intent: string;   // from record_user_intent
  tool_name: string;
  args: object;
  result_summary: string;
}
```

Stored in-memory and flushed to `~/.blockgame/sessions/<id>.json` after every call.

---

## 6. Rendering

### 6.1 Track switch

```tsx
<GameScene>
  {track === "minecraft"
    ? <VoxelScene blocks={scene.blocks} />
    : <LegoScene bricks={scene.blocks} />}
</GameScene>
```

Both renderers consume the same `Block[]` shape; each interprets `type` and `rotation` according to its catalog.

### 6.2 Minecraft renderer

- 1×1×1 voxels, pixel-art textures (16×16 per face), CSS-Minecraft-inspired look
- Instanced meshes for performance (same type + color rendered as one draw call)
- 10–15 MVP colors (white, black, grey, red, orange, yellow, green, blue, navy, purple, brown, pink, dirt-brown)

### 6.3 LEGO renderer

**Block catalog (MVP — 10–12 pieces)**:
- Basic bricks: 1×1, 1×2, 2×2, 2×4, 1×8
- Slope roof: slope_1x2, slope_2x2
- Windows: window_1x2, window_2x2
- Doors: door_1x3
- Baseplate: baseplate_16×16

Each brick is a separate 3D model with studs (top pegs). Snap grid enforces LEGO-unit alignment.

10–15 colors matching official LEGO standards.

### 6.4 Common scene elements

- Ambient + directional lighting
- Isometric grid floor
- Camera controls: mouse drag + `view_from` tool
- UI overlays: instruction log (left), target thumbnail (right), controls (bottom)

---

## 7. Scoring & Reporting

### 7.1 Formula

```
Final = (Voxel IoU × 100)
      + efficiency_bonus     (0 – 15)
      − ambiguity_penalty    (0 – 10, LLM-derived)
      − hint_penalty         (0 – 35)
```

### 7.2 Voxel IoU

```ts
function computeIoU(result: VoxelMap, target: VoxelMap): number {
  let intersection = 0, union = 0;
  const keys = new Set([...result.keys(), ...target.keys()]);
  for (const key of keys) {
    const r = result.get(key);
    const t = target.get(key);
    if (r && t && r.color === t.color) intersection++;
    if (r || t) union++;
  }
  return intersection / union;  // 0.0–1.0
}
```

### 7.3 Efficiency bonus

- Turn count < 5: +15
- 5–10: +10
- 11–20: +5
- 21+: 0

Plus batch-tool bonus: +1 per use of `place_wall` / `place_row`, capped at +5.

### 7.4 Ambiguity penalty — LLM-driven (batch at submit)

When `submit_solution` is called:

1. Server collects the full session log (turns + intents + tool calls).
2. Sends a single LLM request with a structured prompt (Korean + English) asking for:
   - Per-turn ambiguity score (0–10)
   - Session-level positive patterns
   - Common mistakes
   - Wasted actions
   - Missing requirements
3. Average ambiguity → penalty:
   - 0–2: 0 pts (very clear)
   - 3–5: −3 pts
   - 6–8: −7 pts
   - 9–10: −10 pts

**Fallback**: if the LLM call fails (offline, rate limit, etc.), a keyword-based heuristic runs and the report flags `llm_analysis_available: false`.

### 7.5 Hint penalty

| Hint # | Penalty | Cumulative |
|--------|---------|------------|
| 1st    | −5      | −5         |
| 2nd    | −10     | −15        |
| 3rd    | −20     | −35        |

Only 3 hints per session; `get_target_hint` returns `HINT_LIMIT_EXCEEDED` afterward.

### 7.6 Report sections

Modal shown after `submit_solution`:

1. **Header** — final score, grade (S/A/B/C/D), total time, turn count
2. **Score breakdown** — IoU, bonus, penalties
3. **✅ What was good** — specific positive observations (LLM + heuristic)
4. **❌ What was bad** — mistakes, ambiguities, missed context
5. **🗑️ What was unnecessary** — wasted actions (reset_scene overuse, redundant places, unused blocks)
6. **💡 What was missing** — target elements not built (listed with coordinates if possible)
7. **📈 Recommendations** — 2–3 actionable tips for next session

Reports are saved to `~/.blockgame/reports/<timestamp>-<challenge>.json` and can be exported as an image.

---

## 8. Challenge Library

### 8.1 MVP challenges

| # | Title | Difficulty | Mode | Time | Notes |
|---|---|---|---|---|---|
| 1 | 작은 오두막 | Easy | Image | 2 min | Tutorial-style, 5×5×3 |
| 2 | 회색 창고 | Easy | Text spec | 3 min | Box + door/window positions |
| 3 | 2층 주택 | Medium | Image | 5 min | Floor separation + windows |
| 4 | 탑 (Tower) | Medium | Text spec | 5 min | Narrow + sloped roof |
| 5 | ㄱ자 별장 | Hard | Image | 10 min | L-shaped + balcony |

### 8.2 Challenge layout

```
challenges/001-small-cabin/
├─ manifest.json
├─ target-image.png
├─ target-spec.md
├─ target-voxels.json
└─ target-bricks.json
```

### 8.3 `manifest.json` schema

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
    { "level": "small", "penalty": 5,  "text": "집의 바닥면은 5×5입니다." },
    { "level": "medium","penalty": 10, "text": "벽은 흰색 3블록 높이, 지붕은 빨간 경사." },
    { "level": "large", "penalty": 20, "text": "5×5 베이스, 흰 벽 3블록, 경사 빨간 지붕. (x=2, z=0)에 문, 북쪽 벽에 창문 2개." }
  ],
  "optimal_instructions": 5,
  "time_estimate_minutes": 2,
  "tutorial_mode": true
}
```

### 8.4 Acceptance tests per challenge

1. **Solvability** — designer can solve in ≤ optimal_instructions
2. **Score spread** — 10 test runs land in 30–95 range
3. **Ambiguity correlation** — top 5 % scores use noticeably fewer ambiguous terms than bottom 50 %

---

## 9. Error Handling

### 9.1 Tool-level errors (structured responses)

| Code | Cause | Response hint |
|---|---|---|
| `POSITION_OUT_OF_BOUNDS` | grid overflow | include grid bounds in hint |
| `INTENT_NOT_LOGGED` | no `record_user_intent` | ask Claude Code to call it first |
| `INVALID_COLOR` | unknown color | return `list_colors()` |
| `UNKNOWN_BLOCK_TYPE` | unknown type | return `list_block_types(track)` |
| `CHALLENGE_NOT_FOUND` | bad challenge ID | list available challenges |
| `HINT_LIMIT_EXCEEDED` | 4th hint request | report remaining = 0 |

### 9.2 System-level failures

- **Server crash** — session auto-saved after every call; `npx blockgame --resume <id>` restores fully
- **WebSocket drop** — exponential backoff on client; server queues and sends `sync_state` on reconnect
- **Claude Code MCP disconnect** — server keeps running; reconnecting picks up where it left off
- **LLM analysis failure** — keyword fallback; report flags the limitation

---

## 10. Testing Strategy

### 10.1 Unit tests

- **shared/scorer** — 10+ IoU cases, bonus boundaries, penalty tiers, empty results
- **shared/challenge-loader** — manifest parsing, voxel/brick validation, malformed JSON
- **server/tools** — each MCP tool's happy path + primary error paths
- **server/game-state** — concurrent requests, undo/redo, save/load round-trip

### 10.2 Integration tests

- Mock MCP client drives the server through a full challenge run; assert final report structure

### 10.3 Renderer tests

- R3F snapshot tests for each track (blocks rendered with correct colors, positions, studs)

### 10.4 E2E — Playwright happy path

```
1. Launch `npx blockgame`
2. Browser auto-opens, status shows "Waiting for Claude Code"
3. Mock MCP connection established
4. Select challenge "작은 오두막"
5. Mock `record_user_intent` + `place_wall` + `submit_solution`
6. Verify report modal contents (score, sections present, ambiguity penalty applied)
```

### 10.5 MVP acceptance

- [ ] All 5 challenges solvable at ≥ 90 points by the designer
- [ ] 10 playtester runs show target score distribution
- [ ] Zero data loss on server crash / terminal close
- [ ] Playwright happy-path E2E green
- [ ] ≥ 85 % unit-test coverage on `shared/` and `server/mcp/tools`

---

## 11. Future Extensions (v2+)

- **Real-time LLM feedback** — instead of batch at submit
- **User-created challenges** — capture built scenes as new targets
- **Daily challenges** — server generates rotating puzzles
- **Team mode** — alternating-instruction co-op
- **"Sassy AI" mode** — Claude Code configured to ask clarifying questions, raising the bar
- **Additional renderers** — low-poly architecture track, voxel-painted sculpture track, etc.

---

## 12. Open questions (resolve before implementation plan)

- None currently. All design sections were reviewed and approved in the brainstorming session.

---

*This spec was produced via the `superpowers:brainstorming` workflow on 2026-04-17. The next step is `superpowers:writing-plans` to produce a step-by-step implementation plan.*
