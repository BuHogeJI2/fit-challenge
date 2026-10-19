# Fit

Fit is a mobile-first personal tracker for body weight and exercises. All
data stays in the browser on the current device. There is no backend and no
account. It installs to the home screen and works offline.

Because the data lives only in this browser, export a backup file from
Settings now and then. A backup can be restored on another device or
browser.

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- Dexie (IndexedDB)
- wouter
- vite-plugin-pwa
- Vitest + React Testing Library

## Prerequisites

- Node.js 20.19+ or 22.12+
- `pnpm`

## Local Setup

```bash
pnpm install
pnpm dev
```

No environment variables are needed.

## Common Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

The service worker runs only in the production build, so use
`pnpm build && pnpm preview` to check offline and update behavior.

## Docs

- `AGENTS.md`
- `docs/roadmap.md`
- `docs/architecture.md`
- `docs/design-style-guide.md`
- `docs/testing.md`
- `STYLE_GUIDE.md`
