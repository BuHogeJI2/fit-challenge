# AGENTS

Fit is a personal tracker for body weight and exercises, built as a Vite +
React + TypeScript single-page app. It is local-first: all data stays in the
browser on the device, and there is no backend and no auth.

The app is being rebuilt. Product scope and phases live in `docs/roadmap.md`.

## Read This Order

1. `README.md` for local setup and commands.
2. `docs/roadmap.md` for the product, the MVP, and later phases.
3. `STYLE_GUIDE.md` for file structure, naming, and styling rules.

## Current App Constraints

- Frontend only: Vite SPA with `src/main.tsx` as the entry point.
- No network dependency: the app must render and work without any server.
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
- Prefer explicit local data flow over broad abstraction layers.
- Keep the monochrome, chart-first, mobile-first design described in
  `docs/roadmap.md`.
