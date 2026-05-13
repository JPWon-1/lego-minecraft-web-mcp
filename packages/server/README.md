# 차곡차곡 (blockgame-mcp)

말로 시키면 AI가 LEGO·Minecraft 블록을 쌓고, **단계별 조립 설명서**까지 만들어주는 MCP 서버.

- 자연어 → 3D 블록 디자인
- LEGO 매뉴얼 같은 단계별 조립 안내
- `.ldr` 내보내기 → LeoCAD / BrickLink Studio 에서 열기
- 단일 프로세스: stdio MCP + HTTP API + Web UI 모두 한 명령으로

> 요구: Node.js 18+

---

## 실행 방법

### A. Claude Desktop / Claude Code 에서 (추천)

설정 파일에 추가:

| OS | 경로 |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

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

Claude Desktop **완전 재시작** (`Cmd+Q` 후 재실행). 도구 메뉴에 `blockgame` 보이면 OK.

Claude Code CLI 라면:
```bash
claude mcp add blockgame -- npx blockgame-mcp
```

대화 예:
```
> 빨간 지붕 5×5 오두막, 남쪽에 노란 문 하나
```

### B. AI 없이 직접 사용

```bash
npx blockgame
```

브라우저 자동 오픈 → 매체 선택 (LEGO / Minecraft) → 모듈 팔레트와 클릭으로 자유 디자인.

---

## 결과로 받는 것

명령 한 마디 → 다음이 자동으로 일어남:

1. **브라우저 자동 오픈** — `localhost:7788`
2. **실시간 렌더링** — AI가 호출하는 `place_block` 마다 3D 씬에 한 블록씩 차곡차곡 쌓임
3. **조립 설명서 모드** — 완성 후 토글하면 LEGO 매뉴얼처럼 한 장씩:
   - z층별로 묶고 step 당 ≤ 10블록
   - 각 step 부품 리스트 (예: `×4 2×4 빨강`, `×6 1×1 흰색`)
   - 현재 step 블록은 흰 외곽선 강조
4. **`.ldr` 다운로드** — LeoCAD / BrickLink Studio 에서 열어 실제 부품 구입·조립까지

---

## MCP 툴 18개

| 카테고리 | 툴 |
|---|---|
| 배치 | `place_block` `place_row` `place_wall` `stack_bricks` `fill_region` |
| 편집 | `paint_block` `move_block` `remove_block` `undo` `reset_scene` |
| 조회 | `get_scene` `get_target_hint` `list_block_types` `list_brick_catalog` `list_colors` |
| 세션 | `record_user_intent` `submit_solution` `view_from` |

회전 0/90/180/270° 지원 (LEGO). LEGO 트랙은 받침 없는 공중 배치 자동 차단.

---

## 문제 해결

| 증상 | 해결 |
|---|---|
| 도구 메뉴에 `blockgame` 안 보임 | Claude Desktop 완전 종료(`Cmd+Q`) 후 재실행 — 저장만으론 적용 안 됨 |
| 포트 :7788 사용 중 | 이미 다른 인스턴스가 떠 있음. 그 브라우저 탭으로 이동 |
| Windows에서 npx 실패 | `npm install -g blockgame-mcp` 후 `command: "blockgame-mcp"`, `args: []` |

---

## 개발

```bash
pnpm install
pnpm dev          # localhost:7788, Vite HMR 포함
pnpm -r build     # web-app → server, postbuild가 UI를 server/dist/web-app으로 번들
```

---

MIT
