# Roadmap

## Product Overview

Fit Challenge is a mobile-first web app for a shared fitness challenge. The
current product focuses on one featured public run at a time and is optimized
for a fast daily check-in flow on phones.

The product model is built around structured challenge content:

- `challenge_templates`
- `challenge_runs`
- `challenge_days`
- `day_exercises`

Progress is still local to the device in Phase 1. Auth, synced user progress,
and organizer tooling are future work.

## MVP / Phase 1

Phase 1 is the current shipped direction for this repo.

Core rules:

- one featured public run surfaced in the UI
- challenge content loaded from Supabase
- local progress stored per device and keyed by run slug
- past unfinished days shown as `missed`, not auto-completed
- only `today`, `missed`, and `done_local` days can be marked done or undone
- future days stay visible but cannot be marked done
- future content edits can be surfaced with an `Updated` treatment and
  `change_note`

The main screen hierarchy is:

1. challenge intro
2. featured day
3. next 3 days
4. progress summary
5. calendar
6. day details sheet

## Implemented Today

The current repo already includes the Phase 1 app:

- featured run loading from Supabase with run selection based on current date
  and lifecycle
- normalized structured challenge models in `src/lib/challenge/`
- a mobile-first main screen with hero, featured day, upcoming days, progress,
  calendar, and day-details sheet
- local done/undo progress persisted in `localStorage` by run slug
- day-details access from the featured card, upcoming list, and calendar
- baseline Vitest coverage for empty state, day-details opening, local progress
  persistence, undo behavior, and load error handling

## Current Limits

This repo does not yet include:

- authentication
- synced per-user progress in Supabase
- admin tooling
- private runs
- custom challenges
- notifications
- multi-page flows

## Future Roadmap

### Phase 2: Accounts And Synced Progress

- add auth
- store per-user progress in Supabase instead of device-only storage
- support a signed-in challenge experience on top of the current public model

### Phase 3: Challenge Management

- add an admin panel for managing templates, runs, days, and edits
- support custom challenges beyond the single featured public run
- expand organizer workflows for publishing and updating challenge content
- add user-selectable theme variants on top of the semantic token system

### Near-Term Repo Follow-Ups

- add direct tests for `pickFeaturedRun()` and `buildChallengeViewModel()`
- cover loading, scheduled, active, and completed UI states more explicitly
- add done/undo interaction coverage from the day-details sheet
- add a retry affordance for transient load failures
