# Development Setup

## Requirements

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)

## Install

```bash
git clone <repo>
cd ai-architect-game
pnpm install
```

## Build all packages

```bash
pnpm build
```

## Run tests

```bash
pnpm test
```

## Typecheck

```bash
pnpm typecheck
```

## Dev

Web app:

```bash
pnpm --filter @blockgame/web-app dev
```

Server:

```bash
pnpm --filter @blockgame/server build
node packages/server/dist/cli.js
```

## E2E

```bash
pnpm --filter @blockgame/e2e exec playwright install chromium
pnpm --filter @blockgame/e2e test
```

## MVP Acceptance Checklist

Per spec §10.5:

- [ ] All 5 challenges solvable by designer at ≥ 90 points
- [ ] 10 playtester runs show target score distribution
- [ ] Zero data loss on server crash → --resume
- [ ] Playwright happy-path E2E green
- [ ] shared + server coverage ≥ 85%

## Test Coverage

```bash
pnpm --filter @blockgame/shared test -- --coverage
pnpm --filter @blockgame/server test -- --coverage
```
