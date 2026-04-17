# AI Architect Game (blockgame-monorepo)

A pnpm-based monorepo for the AI Architect block-building game.

## Packages

- `@blockgame/shared` — Shared types and utilities
- `@blockgame/server` — Game server
- `@blockgame/web-app` — Web client application
- `@blockgame/renderer-minecraft` — Minecraft-style renderer
- `@blockgame/renderer-lego` — LEGO-style renderer

## Getting Started

```bash
pnpm install
pnpm typecheck
pnpm build
```

## Scripts

- `pnpm build` — Build all packages
- `pnpm test` — Run tests in all packages
- `pnpm typecheck` — Typecheck all packages
- `pnpm dev` — Start the server in dev mode
