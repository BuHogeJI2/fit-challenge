# AGENTS

## Architecture
- Frontend: Vite + React + TypeScript SPA.
- Styling: Tailwind CSS v4 with component-local `*.styles.ts` files and `clsx`.
- Data access: Supabase client in `src/lib/supabaseClient.ts`.
- App entry: `src/main.tsx`.
- Phase 1 may fully rewrite existing frontend code. Current components are not a compatibility target.

## Product Context
- Product vision and MVP scope: `docs/product-plan.md`
- Database schema and seeded challenge data: `docs/db-structure.md`
- Phase 1 execution plan: `docs/mvp-implementation-plan.md`

## Current Phase 1 Rules
- Build a mobile-first public challenge experience for one featured run at a time.
- Use the structured Supabase schema:
  - `challenge_templates`
  - `challenge_runs`
  - `challenge_days`
  - `day_exercises`
- The seeded challenge run starts on `2026-03-12` and lasts 30 days.
- Progress in Phase 1 is per-device only and stored locally in the browser.
- Past days are `elapsed`, not automatically completed.
- Users may mark `today` and `elapsed` days as done locally and undo that later.
- Future days are visible but cannot be marked done.
- Future day edits should surface with an `Updated` badge and `change_note`.
- Auth, private runs, notifications, and admin tooling are out of scope.

## UI and UX Conventions
- Mobile-first layout is the source of truth. Desktop is an enhancement, not the primary design target.
- The main screen order should be:
  - challenge intro
  - today card
  - next 3 days
  - progress summary
  - calendar
  - day details sheet
- Use external UI primitives only where they reduce accessibility risk, such as dialog or sheet behavior.
- Do not adopt a generic component-library visual theme. Keep the product look custom and intentional.
- Interactive day surfaces must be semantic buttons, keyboard reachable, and have visible focus states.
- Status must not rely on color alone.

## Data and State Conventions
- Derive user-facing day state from run dates plus local progress:
  - `today`
  - `upcoming`
  - `elapsed`
  - `done_local`
- Keep data flow explicit and local; do not introduce a broad global state or query library for Phase 1.
- Normalize Supabase results in `src/lib` before they reach presentational components.
- Local progress storage must be keyed by challenge run slug to avoid collisions between runs.

## Implementation Conventions
- Keep components focused and small.
- Keep view logic in `*.tsx`, styles in `*.styles.ts`, and local types in `*.types.ts`.
- Shared hooks, storage helpers, and normalization utilities belong in `src/lib`.
- Favor replacement over adaptation when old code is tightly coupled to the obsolete `Days` model.

## Quality Gates
- Cover loading, error, empty, scheduled, active, and completed run states.
- Verify the main experience at narrow mobile widths before desktop.
- Respect reduced-motion preferences for non-essential motion.
- Add Vitest + React Testing Library coverage for the core Phase 1 flows.
