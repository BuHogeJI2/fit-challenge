# Phase 1 MVP Implementation Status

## Summary

The original Phase 1 rebuild has been implemented as a single-screen public
challenge app. This document now tracks what shipped in the repo and what still
needs follow-up to fully satisfy the Phase 1 quality bar.

## Shipped

### App Structure

- The app is a Vite + React + TypeScript SPA with `ChallengeApp` as the screen
  coordinator.
- The main screen order matches the Phase 1 UX contract:
  1. challenge hero
  2. featured day card
  3. next 3 days
  4. progress summary
  5. calendar
  6. day details sheet

### Data Layer

- The old `Days` model is gone from the current frontend code.
- Supabase content is loaded from:
  - `challenge_runs`
  - `challenge_templates`
  - `challenge_days`
  - `day_exercises`
- Results are normalized into explicit frontend types in
  `src/lib/challenge/challenge.types.ts`.
- Featured run selection is date-aware and handles scheduled, active, and
  completed runs.

### Local Progress

- Progress is stored in `localStorage`.
- Storage is scoped by challenge run slug.
- Users can mark `today` and `elapsed` days done locally.
- Users can undo `done_local` days.
- Future days remain visible but non-actionable.

### Day Details

- The day-details surface is implemented with Radix Dialog.
- Users can open day details from the featured day, upcoming list, and
  calendar.
- The sheet shows title, date, state, summary, notes, exercises, and change
  note when present.

### Testing

- The repo includes Vitest + React Testing Library setup.
- Baseline coverage exists for empty-state rendering, day-details opening, local
  progress persistence, undo behavior, and fetch-error handling.

## Remaining Phase 1 Gaps

### Tests

- Add direct coverage for loading, scheduled, active, and completed render
  states.
- Add logic-focused tests for featured-run selection and day-state derivation.
- Add explicit coverage for done/undo actions from the day-details sheet.

### Product And UX

- Add a retry path for transient load failures.
- Revisit the completed-run experience if a stronger recap state is needed.
- Keep validating narrow mobile layouts as the source of truth when UI changes
  land.

## Non-Goals That Still Apply

- authentication
- server-side per-user progress
- private or custom challenge modes
- admin tooling
- notifications
- multi-page routing
