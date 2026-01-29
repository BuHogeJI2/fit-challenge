# AGENTS

## Architecture
- Frontend: Vite + React + TypeScript (SPA).
- Styling: Tailwind CSS v4 with PostCSS plugin.
- Data access: Supabase client in `src/lib/supabaseClient.ts`.
- UI entry point: `src/components/challenge/ChallengeApp.tsx` rendered by `src/App.tsx`.

## Database Schema (Supabase)
Table: `Days`
- `id` (int8): Primary key.
- `date` (date): ISO date string, used as the calendar key (`YYYY-MM-DD`).
- `exercises` (text): Comma-separated string (displayed as a list).
- `is_done` (bool): Completion status.

## Design System Tokens & Rules
- Theme: Modern dark using Slate/Zinc palette and emerald accents.
- Accent color: Emerald for current day and completed states.
- Background: Gradient layers defined in `src/index.css`.
- Surface layers:
  - `--surface-1`: #0b1220
  - `--surface-2`: #101828
  - `--surface-3`: #141c2d
  - `--surface-glow`: rgba(16, 185, 129, 0.12)
- Use Tailwind utilities for layout/spacing; use `clsx` for conditional classes.
- Typography: Clean sans-serif (Tailwind default stack).

## Data & UI Conventions
- Date keys are generated with local time as `YYYY-MM-DD` for comparisons.
- Challenge start is anchored in `src/components/challenge/utils.ts`.
- Calendar shows the month containing the challenge focus date; future dates are labeled "Upcoming".
- Read-only MVP: no mutation calls; update Supabase data directly.
- Exercises are parsed by splitting on commas and trimming whitespace.

## Future Agent Notes
- Supabase errors should surface via UI messaging (keep read-only flows).
- When adding write actions, keep optimistic updates and error fallback states.
- Keep components small and avoid new state managers unless required.
