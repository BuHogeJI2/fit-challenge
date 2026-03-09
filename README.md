# Fit Challenge

Fit Challenge is a mobile-first web app for a shared monthly fitness challenge.
It shows the featured challenge run, today's session, the next few days, a
full calendar view, and a simple progress summary.

## What It Does Right Now

- loads one featured challenge run from Supabase
- shows structured day and exercise data from the new challenge schema
- lets users open any day in a bottom-sheet details view
- stores completion progress locally on the current device
- keeps the experience public and read-only from the server side

Phase 1 does not include authentication, private groups, notifications, or an
admin interface.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS v4
- Supabase
- Radix Dialog for the day-details sheet
- Vitest + React Testing Library

## Data Model

The app now uses the structured challenge schema documented in
[`docs/db-structure.md`](./docs/db-structure.md):

- `challenge_templates`
- `challenge_runs`
- `challenge_days`
- `day_exercises`

Product direction and implementation notes live in:

- [`docs/product-plan.md`](./docs/product-plan.md)
- [`docs/mvp-implementation-plan.md`](./docs/mvp-implementation-plan.md)

## Local Progress

Until authentication is added, progress is stored in the browser with
`localStorage`, scoped by challenge run slug. That means completion data is
device-specific and will not sync between devices.

## Running Locally

1. Install dependencies:

```bash
pnpm install
```

2. Create env vars for Supabase in `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the dev server:

```bash
pnpm dev
```

## Quality Checks

```bash
pnpm lint
pnpm test
pnpm build
```
