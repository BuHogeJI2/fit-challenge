# AGENTS

Challenge Forge is a Vite + React + TypeScript single-page app for one public
featured fitness challenge run at a time. The current frontend is already on
the Phase 1 architecture: it loads structured challenge data from Supabase,
derives mobile-first day state locally, and stores per-device completion
progress in `localStorage`.

## Read This Order

1. `README.md` for local setup and day-to-day commands.
2. `docs/project-structure.md` for the folder map and ownership boundaries.
3. `docs/architecture.md` for runtime flow, state derivation, and UI assembly.
4. `docs/theme-system.md` for semantic palette rules and component color
   mapping.
5. `docs/design-style-guide.md` for component semantics, interaction roles, and
   passive-vs-interactive UI rules.
6. `docs/db-structure.md` for Supabase schema and local-progress boundaries.
7. `docs/testing.md` for Vitest coverage, commands, and current gaps.
8. `docs/roadmap.md` for the canonical product, MVP, Phase 1, shipped-state,
   and future-direction document.

## Current App Constraints

- Frontend only: Vite SPA with `src/main.tsx` as the entry point.
- Data access: Supabase client in `src/lib/supabaseClient.ts`.
- Domain logic: challenge fetching, normalization, view-model building, and
  local storage live in `src/lib/challenge/`.
- UI composition: screen-level assembly lives in
  `src/components/challenge-app/challenge-app.tsx`.
- Styling: Tailwind CSS v4 via component-local `*.styles.ts` files and `clsx`.
- Theme semantics: canonical color usage rules live in `docs/theme-system.md`
  and the token source of truth lives in `src/index.css`.
- Component semantics: shared button/input/panel rules live in
  `docs/design-style-guide.md` and reusable primitives live in
  `src/components/ui/`.
- State model: no global state library; the app relies on local hooks plus
  derived view models.

## Phase 1 Product Rules

- Surface one featured public challenge run in the UI.
- Use the structured Supabase tables:
  - `challenge_templates`
  - `challenge_runs`
  - `challenge_days`
  - `day_exercises`
- Store completion progress locally per device and key it by run slug.
- Treat past unfinished days as `missed`, not automatically complete.
- Allow done/undo only for `today`, `missed`, and `done_local` days.
- Show future days, but keep them non-actionable.
- Surface future content edits with an `Updated` badge and `change_note`.
- Keep auth, private runs, notifications, and admin tooling out of scope for
  the current implementation.

## Implementation Conventions

- Keep view logic in `*.tsx`, styles in `*.styles.ts`, and local interfaces in
  `*.types.ts`.
- Keep normalization utilities, storage helpers, and shared hooks in `src/lib`.
- Prefer explicit local data flow over broad abstraction layers for this phase.
- Preserve the custom mobile-first UI instead of introducing a generic
  component-library theme.
- Reuse the shared `ui` primitives for interaction semantics before adding new
  one-off button, input, or panel styles.
