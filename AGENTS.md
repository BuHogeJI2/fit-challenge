# AGENTS

Fit is a personal tracker for body weight and exercises, built as a Vite +
React + TypeScript single-page app. It is local-first: all data stays in
IndexedDB in the browser on the device, there is no backend and no auth, and
it installs and works offline as a PWA.

## Read This Order

1. `README.md` for local setup and commands.
2. `docs/roadmap.md` for the product, the MVP, the chart rules, and later
   phases.
3. `docs/architecture.md` for runtime flow, the data model, repository
   invariants, undo, backup, and PWA updates.
4. `docs/design-style-guide.md` for tokens, type, layout, and component roles.
5. `docs/testing.md` for the test setup, coverage map, and manual checks.
6. `STYLE_GUIDE.md` for file structure, naming, and styling rules.

## Current App Constraints

- Frontend only: Vite SPA with `src/main.tsx` as the entry point.
- No network dependency: the app must render and work without any server.
- Data: Dexie in `src/lib/db/`. Screens read through `useLiveQuery`; writes
  go through the repositories, which own the invariants (one weight per date,
  the metric lock, number precision, undo only while nothing changed).
- Backup: `src/lib/backup/` exports a versioned JSON file and restores it as
  a full, validated, all-or-nothing replace.
- Routing: `wouter` with hash location, assembled in
  `src/components/app/app.tsx`.
- Styling: Tailwind CSS v4 via component-local `*.styles.ts` files and
  `clsx`. Design tokens (colors, fonts) live in the `@theme` block of
  `src/index.css`.
- One theme and English only.
- State model: no global state library.

## Implementation Conventions

- Keep view logic in `*.tsx`, styles in `*.styles.ts`, and local interfaces in
  `*.types.ts`.
- Keep domain logic, storage helpers, and shared hooks in `src/lib`.
- Reuse the primitives in `src/components/ui/` and the charts in
  `src/components/charts/` before adding new ones.
- Prefer explicit local data flow over broad abstraction layers.
- Keep the monochrome, chart-first, mobile-first design described in
  `docs/design-style-guide.md`.
