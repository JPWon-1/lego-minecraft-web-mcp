# AI Architect

> 레고·마인크래프트로 집을 지으면서 AI 커뮤니케이션 스킬을 측정·훈련하는 게임

## 빠른 시작

```bash
# 1. 서버 실행 (브라우저 자동 오픈)
npx blockgame

# 2. 다른 터미널에서 Claude Code 등록
claude mcp add blockgame -- npx blockgame-mcp

# 3. Claude Code 실행 후 대화로 집 짓기
claude
> 내가 5x5 빨간 지붕 오두막을 지어줘
```

## 프로젝트 구조

Monorepo with 5 packages:

- `@blockgame/shared` — types, scorer, challenge loader
- `@blockgame/server` — MCP + Express + WebSocket
- `@blockgame/web-app` — React UI
- `@blockgame/renderer-minecraft` — R3F voxel scene
- `@blockgame/renderer-lego` — R3F LEGO scene

## 개발

See `docs/INSTALL.md` for development setup.

## 게임플레이

플레이어는 Claude Code에 자연어로 지시하여 타겟 이미지/스펙에 맞는 집을 짓습니다. 점수는:

- **Voxel IoU** (0-100): 타겟과 일치하는 블록 비율
- **효율 보너스** (0-15): 적은 턴·대량 도구 사용
- **모호함 페널티** (0-10): LLM이 분석한 지시 모호성
- **힌트 페널티** (0-35): 3번 제한, 단계별 페널티

제출 후 상세 리포트:

- 잘한 점, 개선점, 불필요한 동작, 놓친 것, 다음엔 이렇게

## 설계 및 구현 문서

- 설계 스펙: `docs/superpowers/specs/2026-04-17-ai-architect-game-design.md`
- 구현 플랜: `docs/superpowers/plans/2026-04-17-ai-architect-game-plan.md`

## 라이선스

Private.
