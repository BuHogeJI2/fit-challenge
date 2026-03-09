# Database Structure

## Purpose

This document describes the current Supabase schema direction for the rebuilt
Fit Challenge product and the seeded challenge data used for the first official
monthly run.

This schema replaces the old `Days` table approach. The old structure was too
flat for the rebuilt product because it could not cleanly support structured
exercise data, multiple challenge runs, future edits, or later user progress.

## Current Tables

### `challenge_templates`

Stores reusable challenge definitions.

Fields:

- `id`: primary key
- `slug`: unique template identifier
- `title`: challenge name
- `description`: longer challenge description
- `duration_days`: number of days in the template
- `difficulty`: short difficulty label
- `cover_note`: summary guidance for the whole challenge
- `is_published`: whether the template is ready to be used
- `created_at`: creation timestamp

### `challenge_runs`

Stores scheduled instances of a template.

Fields:

- `id`: primary key
- `template_id`: reference to `challenge_templates.id`
- `slug`: unique run identifier
- `title_override`: optional run-specific title
- `description_override`: optional run-specific description
- `starts_on`: start date of the run
- `ends_on`: end date of the run
- `status`: run status (`draft`, `scheduled`, `active`, `completed`, `archived`)
- `created_at`: creation timestamp

### `challenge_days`

Stores one day of planned content for a specific run.

Fields:

- `id`: primary key
- `run_id`: reference to `challenge_runs.id`
- `day_number`: sequential day in the run
- `date`: calendar date for the day
- `title`: short day label
- `summary`: short daily summary
- `notes`: longer execution note
- `estimated_minutes`: expected effort duration
- `is_rest_day`: whether the day is a recovery day
- `change_note`: note describing a future update to that day
- `updated_at`: update timestamp

Constraints:

- unique per `run_id + day_number`
- unique per `run_id + date`

### `day_exercises`

Stores the ordered exercise rows for a challenge day.

Fields:

- `id`: primary key
- `challenge_day_id`: reference to `challenge_days.id`
- `position`: order within the day
- `exercise_name`: visible exercise name
- `target_reps`: rep target for rep-based exercises
- `target_seconds`: duration target for timed exercises
- `rest_seconds`: suggested rest between sets
- `notes`: exercise-specific note
- `substitution`: optional alternative exercise

Constraints:

- unique per `challenge_day_id + position`
- each row must have either `target_reps` or `target_seconds`

## Current Seeded Challenge

The current seeded data represents one official 30-day challenge run.

### Template

- `slug`: `pushups-situps-abs-30-day`
- `title`: `Pushups, Sit-ups, Abs Challenge`
- `duration_days`: `30`
- `difficulty`: `medium`

### Run

- `slug`: `march-2026-pushups-situps-abs-run`
- `starts_on`: `2026-03-12`
- `ends_on`: `2026-04-10`
- `status`: `scheduled`

## Exercise Structure

The seeded challenge uses three exercise names:

- `pushups`
- `sit-ups`
- `abs`

Each day includes exactly two of those three exercises. The pairs rotate in a
3-day pattern:

1. `pushups` + `sit-ups`
2. `pushups` + `abs`
3. `sit-ups` + `abs`

That pattern repeats through the 30-day run.

## Progression Rule

The rep target is progressive across the full challenge:

- starts at `60` reps per exercise on day 1
- ends at `120` reps per exercise on day 30
- scales upward gradually across the run

Each daily exercise row stores that day's target in `target_reps`.

## Product Notes

- This schema is designed for one official monthly run in the first shipped UI.
- The schema is intentionally broader than the current frontend implementation.
- Future user-specific progress should be added in separate auth-era tables
  rather than mixed into challenge content tables.
- Future day edits should update `challenge_days.updated_at` and may use
  `change_note` to explain what changed.

## Deferred Tables

These are planned for later phases and are not part of the current seed setup:

- `profiles`
- `user_run_progress`
- `user_day_progress`
