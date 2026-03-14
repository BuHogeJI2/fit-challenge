# Fit Challenge

Fit Challenge is a mobile-first React app for a public monthly fitness
challenge. The current build shows one featured challenge run, highlights the
current or most relevant day, lets users inspect the full calendar, and stores
completion locally on the current device.

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Radix Dialog
- Vitest + React Testing Library

## Prerequisites

- Node.js 20+
- `pnpm`

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the dev server:

```bash
pnpm dev
```

## Common Commands

```bash
pnpm lint
pnpm test
pnpm build
```

## Docs

- `AGENTS.md`
- `docs/project-structure.md`
- `docs/architecture.md`
- `docs/db-structure.md`
- `docs/testing.md`
- `docs/roadmap.md`
