# Phase 1 MVP Implementation Plan

## Goal

Rewrite the current SPA into a mobile-first public challenge app for one
featured challenge run, using the structured Supabase schema and local device
progress.

## Non-Goals

- authentication
- per-user server-side progress
- private or custom challenge modes
- organizer UI
- notifications
- routing to multiple pages

## Execution Order

1. Update repo guidance and planning docs.
2. Replace the old `Days`-based data layer with the new run/day/exercise model.
3. Rebuild the top-level app shell and mobile-first information hierarchy.
4. Add local progress storage and done/undo interactions.
5. Add day-details sheet interaction and calendar navigation.
6. Add test coverage for core states and interactions.
7. Verify with lint, build, and tests.

## Data Layer

### Supabase Reads

Load one featured run and its related records:

- `challenge_runs`
- nested `challenge_days`
- nested `day_exercises`
- optional template metadata from `challenge_templates`

The app should gracefully handle:

- no featured run
- a scheduled run that has not started yet
- an active run
- a completed run
- partially seeded day or exercise data
- Supabase request failures

### Normalized Models

Use explicit frontend models:

- `TChallengeTemplate`
- `TChallengeRun`
- `TChallengeDay`
- `TDayExercise`
- `TChallengeDayWithExercises`
- `TLocalProgressEntry`
- `TLocalProgressMap`

### Derived State

Derive user-facing day status from dates and local progress:

- `today`
- `upcoming`
- `elapsed`
- `done_local`

Also derive:

- featured day for the hero and today card
- next 3 visible upcoming days
- schedule progress
- local completion progress
- calendar month grid items

## UI Structure

### App Shell

The top-level screen should own loading, error, empty, and success states.

### Screen Order

1. Challenge intro
2. Today card
3. Next 3 days
4. Progress summary
5. Calendar
6. Day details sheet

### Day Details

Use an accessible bottom sheet or dialog primitive. It should open from the
today card, next-days list, and calendar cells and show:

- day title
- date
- day state
- change note if present
- summary
- notes
- ordered exercises
- done or undo action when eligible

### Interaction Rules

- `today` and `elapsed` days can be marked done locally.
- `done_local` days can be undone.
- `upcoming` days are visible but not actionable.
- Future edited days show an `Updated` badge and `change_note`.

## Styling Direction

- Use Tailwind utilities with component-local style maps.
- Keep the visual system custom rather than adopting a generic library theme.
- Prioritize touch-friendly spacing, large tap targets, and strong hierarchy.
- Keep the month calendar secondary to the daily flow.
- Motion should be limited, intentional, and reduced-motion aware.

## Testing

Add Vitest and React Testing Library coverage for:

- successful load of a featured run
- no featured run state
- Supabase error state
- open day details from next-days list
- open day details from calendar
- mark done and undo behavior
- local progress persistence by run slug

## Acceptance Criteria

- The UI works well on narrow mobile widths first.
- The app no longer depends on the old `Days` table or comma-separated exercises.
- The featured run can be scheduled, active, or completed without breaking the UI.
- Local progress is isolated to the current run slug and survives refresh.
- The day-details surface is accessible and replaces the old tooltip behavior.
