# Fit Challenge Product Plan

## Vision

Fit Challenge is a mobile-first web app for small groups following a shared
fitness challenge. The current product focuses on one official public run at a
time, with a fast daily workflow that works well from a phone.

## Current Product Model

The shipped frontend is built around four content concepts:

- `challenge_templates`: reusable challenge definitions
- `challenge_runs`: scheduled instances of a template
- `challenge_days`: dated daily sessions within a run
- `day_exercises`: ordered exercise rows for each day

Per-user completion is intentionally not stored in Supabase yet. In the current
phase it stays on the device in browser storage.

## Current User Experience

The home screen is organized around the daily flow instead of the calendar:

1. challenge intro
2. featured day
3. next 3 days
4. progress summary
5. calendar
6. day details sheet

This keeps the calendar useful for planning without making it the primary
surface.

## Phase 1 Rules

- Public experience only
- One featured official run surfaced in the UI
- No authentication
- No admin panel
- Challenge content managed in Supabase
- Progress stored locally per device and scoped by run slug

### Day States

- `today`: current day in the run
- `upcoming`: future day
- `elapsed`: past unfinished day
- `done_local`: completed on this device

Past unfinished days are not auto-completed.

### Editing Rules

- Future day edits may be published by organizers.
- The UI should surface those edits with an `Updated` treatment and a short
  `change_note`.
- Past-day history should not be silently rewritten from the product
  perspective.

## Current Strengths

- Structured exercise data is no longer flattened into comma-separated text.
- The app can render upcoming, active, and completed run windows.
- Local completion is isolated per challenge run instead of being global.
- Every visible day can be inspected from the main screen or calendar.

## Next Product Phases

### Phase 2

- Add authentication
- Persist per-user progress in Supabase
- Support joining official runs with an account
- Introduce self-paced personal runs

### Phase 3

- Add private and custom challenge runs
- Add organizer tooling for challenge authoring and edits
- Add notifications and reminders
- Expand progress summaries and analytics
