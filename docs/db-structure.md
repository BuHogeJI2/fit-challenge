# Database Structure

## Purpose

This document describes the structured Supabase content model used by the
current frontend and the local-storage boundary for Phase 1 progress.

The current app no longer depends on the old flat `Days` table. Challenge
content is split across reusable templates, scheduled runs, dated days, and
ordered exercise rows.

## Content Tables

### `challenge_templates`

Reusable challenge definitions.

Fields:

- `id`
- `slug`
- `title`
- `description`
- `duration_days`
- `difficulty`
- `cover_note`
- `is_published`
- `created_at`

### `challenge_runs`

Scheduled instances of a template.

Fields:

- `id`
- `template_id`
- `slug`
- `title_override`
- `description_override`
- `starts_on`
- `ends_on`
- `status`
- `created_at`

Supported status values in the frontend:

- `draft`
- `scheduled`
- `active`
- `completed`
- `archived`

The app currently fetches candidate featured runs from `scheduled`, `active`,
and `completed`.

### `challenge_days`

One planned day within a run.

Fields:

- `id`
- `run_id`
- `day_number`
- `date`
- `title`
- `summary`
- `notes`
- `estimated_minutes`
- `is_rest_day`
- `change_note`
- `updated_at`

Constraints:

- unique per `run_id + day_number`
- unique per `run_id + date`

### `day_exercises`

Ordered exercises for a challenge day.

Fields:

- `id`
- `challenge_day_id`
- `position`
- `exercise_name`
- `target_reps`
- `target_seconds`
- `rest_seconds`
- `notes`
- `substitution`

Constraints:

- unique per `challenge_day_id + position`
- each row must define either `target_reps` or `target_seconds`

## Frontend Mapping

Supabase rows are normalized in `src/lib/challenge/challenge.api.ts` into
camelCase models before they reach the UI:

- `challenge_templates` -> `TChallengeTemplate`
- `challenge_runs` -> `TChallengeRun`
- `challenge_days` -> `TChallengeDay`
- `day_exercises` -> `TDayExercise`

The combined loaded shape is `TFeaturedChallenge`.

## Seeded Run Notes

The docs and tests assume one 30-day public run with this date window:

- `slug`: `march-2026-pushups-situps-abs-run`
- `starts_on`: `2026-03-12`
- `ends_on`: `2026-04-10`

The exact runtime `status` for that seeded run depends on the environment and
should reflect its current lifecycle.

## Local Progress Boundary

Phase 1 completion progress is not stored in Supabase.

- progress lives in browser `localStorage`
- storage keys use the run slug to avoid collisions
- entries are keyed by challenge day number
- a stored entry represents a local completion mark plus timestamp

This keeps content data and temporary per-device progress separate until auth
and user-specific tables are introduced.

## Deferred Tables

These are still future-facing and are not part of the current frontend data
flow:

- `profiles`
- `user_run_progress`
- `user_day_progress`
