<div align="center">

# 🧱 차곡차곡

### 말하면 차곡차곡 쌓아드려요

자연어로 LEGO·Minecraft 블록을 설계하고
**단계별 조립 설명서**까지 자동으로 만들어주는 AI 디자이너.
진짜 LEGO 부품으로 그대로 따라 지을 수 있어요.

`MIT` · `Made in KR` · `MCP-powered`

</div>

---

```
       ┌──────────────┐         ┌────────────┐         ┌──────────────┐
"빨간   │              │  MCP    │   AI가     │  WS     │   브라우저    │
지붕    │   Claude     │ ──────▶ │  차곡차곡   │ ──────▶ │   3D 씬에     │
집"     │              │         │   배치     │         │   실시간 렌더 │
        └──────────────┘         └────────────┘         └──────────────┘
                                                              │
                                                              ▼
                                                       ┌──────────────┐
                                                       │  📐 조립      │
                                                       │  설명서 +    │
                                                       │  .ldr 파일   │
                                                       └──────────────┘
```

---

## ✨ 한 눈에

| | |
|---|---|
| 🗣️ **자연어 디자인** | "빨간 지붕 작은 오두막" 한 마디면 AI가 설계 |
| 🧱 **두 가지 매체** | LEGO (다양한 브릭·물리 검증) / Minecraft (자유 복셀) |
| 🔄 **회전 지원** | 0/90/180/270° — 단일 브릭과 모듈 모두 |
| 🪟 **모듈 팔레트** | 창문·문·지붕·기둥·굴뚝·계단·나무 — 미리 만들어진 조합 |
| 📐 **조립 설명서** | LEGO 매뉴얼처럼 단계별로 다시 보기 + 부품 리스트 |
| 💾 **LDraw export** | `.ldr` 파일로 LeoCAD·BrickLink Studio 에서 열기 |
| 🤝 **단일 프로세스** | 한 명령으로 stdio MCP + HTTP API + Web UI 동시에 |

---

## 🚀 빠른 시작

> 사전 준비: **Node.js 18+** 만 있으면 됩니다. (`node --version` 으로 확인)

### A. Claude Desktop 에서 사용 (가장 추천)

#### 1️⃣ 설정 파일 열기

**방법 1 — Claude Desktop UI 안에서 (간편)**
```
Claude Desktop  →  Settings  →  Developer  →  Edit Config
```

**방법 2 — 파일 직접 열기**

| OS | 경로 |
|---|---|
| 🍎 macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| 🪟 Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| 🐧 Linux | `~/.config/Claude/claude_desktop_config.json` |

파일 없으면 직접 새로 만드세요.

#### 2️⃣ MCP 등록 (한 줄 추가)

```json
{
  "mcpServers": {
    "blockgame": {
      "command": "npx",
      "args": ["-y", "blockgame-mcp"]
    }
  }
}
```

> 이미 `mcpServers` 안에 다른 항목이 있다면 그 객체 안에 `"blockgame": {...}` 만 추가하세요.

#### 3️⃣ Claude Desktop **완전 재시작**

저장만으로는 안 됨. 메뉴바 / 시스템 트레이에서 **완전 종료** 후 다시 실행.

- 🍎 macOS : `Cmd + Q` 로 완전 종료
- 🪟 Windows : 시스템 트레이 → Claude 우클릭 → Quit
- 🐧 Linux : 패널 아이콘 우클릭 → Quit

#### 4️⃣ 연결 확인

새 대화 열기 → 채팅 입력란 옆 **🔌 도구 아이콘** 클릭 → `blockgame` 항목이 보이면 OK.
(또는 채팅에 "blockgame 툴 목록 보여줘" 라고 물어도 18개 툴이 떠야 함.)

#### 5️⃣ 처음 명령

```
> 빨간 지붕 5×5 오두막을 지어줘, 남쪽에 노란 문 하나
```

자동으로 브라우저가 열려 `localhost:7788` 에서 차곡차곡 쌓이는 게 보입니다.

---

### B. Claude Code (CLI) 에서 사용

CLI 한 줄로 등록:

```bash
claude mcp add blockgame -- npx blockgame-mcp
```

확인:
```bash
claude mcp list                # blockgame 이 보이면 OK
```

대화:
```bash
claude
> 10층 회색 돌탑, 꼭대기에 빨간 깃발 추가
```

---

### C. AI 없이 직접 디자인

```bash
npx blockgame
```

브라우저 자동 오픈 → 매체 선택 → **모듈 팔레트**(창문·문·지붕)와 클릭으로 자유 디자인.

---

### 🆘 문제 해결

| 증상 | 해결 |
|---|---|
| 🔌 도구 메뉴에 `blockgame` 안 보임 | Claude Desktop **완전 종료 후** 재실행 (저장만으로는 적용 안 됨) |
| `Cannot find module 'blockgame-mcp'` | Node 18+ 인지 (`node --version`) · 인터넷 연결 확인 (npx가 처음에 다운로드함) |
| 명령했는데 브라우저 안 열림 | 직접 `localhost:7788` 열기. 또는 차곡차곡 명령 시 `브라우저 자동 오픈은 첫 인스턴스만`이라 이미 다른 Claude 대화가 :7788 점유 중일 수 있음 |
| 포트 :7788 이미 사용 중 | 다른 차곡차곡이 이미 떠 있음. 그 브라우저 탭으로 가면 같은 씬 보임. 새로 시작하려면 기존 인스턴스 종료. |
| `INTENT_NOT_LOGGED` 에러 | Claude가 30초 안에 `record_user_intent` 후속 호출 안 함 — 재시도하거나 다시 부탁 |
| 설정 JSON 문법 오류 | 콤마 위치 · 따옴표 확인. [JSON 유효성 검사기](https://jsonlint.com) 활용 |
| Windows에서 npx 안 됨 | `npm install -g blockgame-mcp` 후 `args` 를 `["blockgame-mcp"]` (npx -y 빼기), `command` 를 `blockgame-mcp` 로 |

---

## 📖 사용 흐름

```
   ① 말한다           ② 쌓인다              ③ 설명서로 받는다
  ─────────────     ─────────────         ─────────────
                                        STEP 1 / 50
   "빨간 지붕         🟥                   ┌─────┐
    작은 집"          🟥🟥🟥               │ × 4 │  2×4 빨강
                      🟫🟫🟫🟫🟫            │ × 6 │  1×1 흰색
                      🟩🟩🟩🟩🟩            │ × 2 │  도어 노랑
                                          └─────┘
```

1. **말한다** — 자연어 한 마디 (또는 직접 클릭)
2. **쌓인다** — AI가 한 칸씩 차곡차곡 블록을 놓아줘요. 떠있는 블록 자동 차단.
3. **설명서로 받는다** — 한 장씩 넘기는 조립 설명서 + 부품 리스트. 진짜 LEGO 부품으로도.

---

## 🛠 동작 방식

### 단일 프로세스 아키텍처

`blockgame-mcp` 한 프로세스가 모든 걸 합니다:

```
┌─────────────────────────────────────────────────────────────────┐
│                     blockgame-mcp 프로세스                       │
│                                                                 │
│  ┌─────────────┐                          ┌─────────────────┐   │
│  │  stdio I/O  │ ◀────── MCP 프로토콜 ───▶ │  GameState      │   │
│  │  (Claude)   │                          │  - blocks[]     │   │
│  └─────────────┘                          │  - turns[]      │   │
│                                           │  - rotation     │   │
│  ┌─────────────┐    ┌────────────────┐    │  - support 검증 │   │
│  │  HTTP :7788 │───▶│   18 MCP Tools │───▶│                 │   │
│  │   /api/*    │    │ (place_block,  │    └─────────────────┘   │
│  │   /ws       │    │  paint, ...)   │            │             │
│  └─────────────┘    └────────────────┘            │ 변경        │
│        │                                          ▼             │
│        │                                  ┌──────────────┐      │
│        │            broadcast             │ Broadcaster  │      │
│        │ ◀────────────────────────────────│  (WebSocket) │      │
│        │                                  └──────────────┘      │
│        ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Static UI   │  (web-app/dist 또는 dev 모드는 Vite middleware)│
│  └─────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
   브라우저 (React + R3F)
```

핵심 포인트:
- **포트 한 개 (`:7788`)** — API · WebSocket · 정적 파일 모두
- **상태 공유** — Claude가 stdio로 쏜 명령과 사용자가 클릭으로 한 명령이 같은 GameState 갱신
- **graceful degrade** — :7788 점유되면 stdio-only 모드로 떨어짐

### 시나리오 1 — Claude가 자연어로 짓기

```
사용자: "빨간 지붕 집 지어줘"
            │
            ▼
Claude  ──── tools/call record_user_intent ────▶ blockgame-mcp
        ──── tools/call place_block(red, 2x4, [3,4,0]) ──▶
        ──── tools/call place_block(red, 2x4, [5,4,0]) ──▶
                                                 │
                                  validate (overlap, support, rotation)
                                                 │
                                  GameState.addBlock + Broadcaster.emit
                                                 │
                                                 ▼
                                  WS: {type:"block_added", block:...}
                                                 │
                                                 ▼
                                  브라우저 React reducer → R3F 씬 갱신
                                                 │
                                                 ▼
                                  사용자가 화면에서 차곡차곡 쌓이는 걸 봄
```

### 시나리오 2 — 사용자가 직접 클릭

```
사용자가 마우스로 베이스플레이트 클릭
            │
            ▼
R3F raycaster (그리드 셀 좌표 변환)
            │
            ▼
GameScreen.placeAt(position)
            │
   selectedModule 있음?
       ├─ YES: 부품 N개 → 회전된 offset → 순차 place_block
       └─ NO : place_block(type, position, color, rotation)
            │
            ▼
POST /api/tools/call
            │  (이후는 시나리오 1과 동일)
            ▼
검증 → broadcast → 모든 클라이언트(Claude + 브라우저) 동기화
```

### 시나리오 3 — 모듈 회전

```
모듈 클릭             ROTATE 클릭          마우스 hover            좌클릭
─────────             ────────────         ───────────             ─────
selectedModule =      selectedRotation +=  ghost 렌더:             각 part:
  창문3×3                 90°                hoverCell +              place_block(
  parts:[                                    rotateOffset(             rotated_pos,
   (0,0,0),                                    p.offset,               rotation: 90
   (2,0,0),                                    rotation                )
   (1,0,1) ...]                              )
                                               각 부품 개별 ghost
```

수식:
```
rotateOffset((x, y), 90°)  =  (-y,  x)
rotateOffset((x, y), 180°) =  (-x, -y)
rotateOffset((x, y), 270°) =  ( y, -x)
```

### 시나리오 4 — 조립 설명서 생성

```
현재 씬 (Block[])
       │
       ▼
computeBuildSteps()                ┌───────────────────────┐
  - z 층별 그룹핑                   │ STEP 4 / 50           │
  - 한 step ≤ 10블록 (필요시 분할)  │ z=2 · 8 blocks (2/3)  │
  - 각 step의 부품 집계              │ ┌───┐                 │
       │                            │ │×4 │ 1×1 흰색         │
       ▼                            │ │×4 │ 2×4 빨강         │
InstructionPanel                    │ └───┘                 │
  - step 슬라이더                    └───────────────────────┘
  - 자동재생 / Prev / Next            ▲
  - 현재 step 블록만 외곽선 강조        │
                                       │
                              씬에 step 1..현재 까지의 블록만 렌더
                              현재 step의 블록은 흰 outline + emissive glow
```

### 시나리오 5 — LDraw export

```
Block[]
   │
   ▼
blocksToLdraw(blocks)
   ├─ 부품 매핑    : brick_2x4 → 3001.dat,  door_1x3 → 1×1 × 3 stack
   ├─ 색상 매핑    : #E4202B → 4 (Red),  #FFCD00 → 14 (Yellow), ...
   ├─ 좌표 변환    : (gx, gy, gz) → (gx*20, -gz*24, gy*20)  [LDU]
   └─ 회전 행렬    : 0/90/180/270 → 3×3 Y축 행렬
   │
   ▼
.ldr 텍스트
   │
   ▼
Blob → 자동 다운로드 → LeoCAD / BrickLink Studio 에서 열기
```

---

## 🧰 MCP 툴 18개

| 카테고리 | 툴 |
|---|---|
| 🟥 **배치** | `place_block` `place_row` `place_wall` `stack_bricks` `fill_region` |
| 🟦 **편집** | `paint_block` `move_block` `remove_block` `undo` `reset_scene` |
| 🟩 **조회** | `get_scene` `get_target_hint` `list_block_types` `list_brick_catalog` `list_colors` |
| 🟨 **세션** | `submit_solution` `view_from` `record_user_intent` |

`place_block` 시그니처:

```ts
place_block({
  track:     "lego" | "minecraft",
  type:      string,                    // brick_1x1, brick_2x4, slope_2x2, ...
  position:  [x, y, z],
  color:     "#RRGGBB",
  rotation?: 0 | 90 | 180 | 270         // LEGO만 의미 있음
})
```

에러 코드:

| 코드 | 언제 |
|---|---|
| `INTENT_NOT_LOGGED` | `record_user_intent` 먼저 호출 안 함 |
| `OVERLAP` | 다른 블록 자리에 시도 |
| `UNSUPPORTED_PLACEMENT` | LEGO 트랙에서 받침 없는 공중 배치 |
| `INVALID_ROTATION` | 0/90/180/270 외 값 |

---

## 🏗 받침(support) 검증

LEGO 트랙은 떠있는 블록을 차단합니다. 모든 블록은 다음 셋 중 하나를 만족해야 함:

| 조건 | 예시 |
|---|---|
| z-바닥이 0 | 베이스플레이트 위 첫 층 |
| z−1에 footprint 겹치는 블록 | 직접 위로 쌓기 |
| 같은 z에 footprint 인접한 블록 | 박공 지붕 안쪽 셀이 옆 처마에 기대기 |

Minecraft 트랙은 자유 부양 허용 (게임 본 특성).

---

## 💾 LDraw 매핑

### 부품

| 우리 타입 | LDraw 부품 |
|---|---|
| `brick_1x1` | `3005.dat` |
| `brick_1x2` | `3004.dat` |
| `brick_2x2` | `3003.dat` |
| `brick_2x4` | `3001.dat` |
| `brick_1x8` | `3008.dat` |
| `slope_1x2` | `3040.dat` |
| `slope_2x2` | `3039.dat` |
| `window_1x2` | `60593.dat` |
| `window_2x2` | `60592.dat` |
| `door_1x3` | `3005.dat` × 3 (수직 스택) |
| `voxel_1x1` (MC) | `3005.dat` (1×1 brick) |
| `baseplate_16x16` | (skip) |

### 색상

LEGO 공식 번호로 매핑:
`4` Red, `14` Yellow, `1` Blue, `2` Green, `15` White, `0` Black, `71` Light Bluish Gray, `25` Orange, `70` Reddish Brown, `5` Pink, `22` Dark Purple. 알 수 없는 hex는 `16`(parent inherit).

### 좌표

```
우리 (gx, gy, gz)  →  LDraw (gx × 20,  -gz × 24,  gy × 20)
                                ↑ Y축은 아래
                                  1 stud = 20 LDU,  1 brick height = 24 LDU
```

---

## 📦 프로젝트 구조

monorepo, 5 패키지:

| 패키지 | 역할 |
|---|---|
| `@blockgame/shared` | 공통 타입 (Block, Track, Rotation, ToolResult) · 챌린지 로더 |
| `@blockgame/server` | MCP 서버 (stdio + HTTP + WebSocket) · 18 툴 · 받침 검증 · 세션 영속화 |
| `@blockgame/web-app` | React UI (Landing · ModeSelect · GameScreen · DesignPanel · InstructionPanel · LDraw export) |
| `@blockgame/renderer-lego` | R3F LEGO 씬 (브릭, 스터드, 베이스플레이트, hover ghost, 회전) |
| `@blockgame/renderer-minecraft` | R3F voxel 씬 (단순 큐브) |

### 개발 / 빌드

```bash
pnpm install
pnpm dev         # :7788 단일 서버 + Vite middleware HMR
                 # 브라우저는 localhost:7788 만 열면 됨
                 # (HMR ws은 :24678로 분리, 사용자 시야엔 안 보임)

pnpm -r build    # web-app → server 순서 빌드
                 # postbuild가 web-app/dist를 server/dist/web-app에 번들
```

프로덕션 실행:

```bash
node packages/server/dist/cli.js   # = npx blockgame
```

---

## 📜 라이선스

MIT.
