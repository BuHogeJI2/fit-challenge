# Project Structure

## Overview

The repository is a single frontend package. There is no server runtime in this
repo; the app reads public challenge content directly from Supabase and manages
device-local progress in the browser.

## Top-Level Layout

```text
.
├── AGENTS.md
├── README.md
├── docs/
├── package.json
├── tailwind.config.cjs
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
```

## Source Layout

```text
src/
├── components/
│   ├── challenge-app/
│   ├── challenge-calendar/
│   ├── challenge-hero/
│   ├── challenge-status/
│   ├── day-details-sheet/
│   ├── featured-day-card/
│   ├── progress-summary/
│   └── upcoming-days/
├── lib/
│   ├── challenge/
│   └── supabaseClient.ts
├── test/
├── index.css
├── main.tsx
└── vite-env.d.ts
```

## Folder Responsibilities

### `src/main.tsx`

Creates the React root, imports global CSS, and mounts `ChallengeApp`.

### `src/components/`

Holds presentational and screen-composition code.

- `challenge-app/`: top-level state assembly for loading, error, empty, and
  success paths.
- `challenge-hero/`: challenge intro header with run metadata and progress
  snapshot.
- `featured-day-card/`: the primary day card for the opening, current, or final
  day depending on run phase.
- `upcoming-days/`: preview list for the next three upcoming days.
- `progress-summary/`: schedule progress and device-local completion summary.
- `challenge-calendar/`: month-grouped calendar navigation.
- `day-details-sheet/`: Radix Dialog-based day details surface.
- `challenge-status/`: loading, error, and empty states.

Each component folder follows the same local structure:

- `*.tsx` for rendering logic
- `*.styles.ts` for Tailwind class maps
- `*.types.ts` for local props and helper types
- `index.ts` for exports

### `src/lib/challenge/`

Owns the challenge domain model.

- `challenge.api.ts`: Supabase reads and row-to-model normalization.
- `challenge.types.ts`: normalized domain types and view-model shapes.
- `challenge.utils.ts`: date helpers, featured-run selection, formatting, and
  view-model derivation.
- `challenge.storage.ts`: `localStorage` read/write helpers scoped by run slug.
- `use-featured-challenge.ts`: async loading hook.
- `use-local-challenge-progress.ts`: local progress state and toggle behavior.
- `index.ts`: public barrel exports for the challenge module.

### `src/lib/supabaseClient.ts`

Creates the Supabase client from `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`, and fails fast when env vars are missing.

### `src/test/`

Vitest + React Testing Library coverage for app behavior and hook-level loading
error handling.

## Current Data Flow

1. `ChallengeApp` calls `useFeaturedChallenge()` to load the featured run.
2. `fetchFeaturedChallenge()` reads runs, picks the featured one by date and
   lifecycle, then loads its template, days, and exercises.
3. `useLocalChallengeProgress()` reads and writes run-scoped completion state in
   `localStorage`.
4. `buildChallengeViewModel()` combines normalized Supabase data and local
   progress into the UI-facing model.
5. Presentational components render the view model and route interactions back
   up through `ChallengeApp`.

## Config Files

- `package.json`: scripts and dependency manifest.
- `vite.config.ts`: React plugin, Tailwind Vite plugin, and Vitest config.
- `tailwind.config.cjs`: Tailwind configuration entrypoint.
- `tsconfig*.json`: TypeScript project configuration for app and tooling.

## Not In This Repo

- No backend or API server.
- No migration files or SQL seed scripts.
- No auth flow or user profile management.
- No deployment configuration checked into the current workspace.
