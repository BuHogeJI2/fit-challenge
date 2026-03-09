# Fit Challenge Product Plan

## Vision

Fit Challenge is a mobile-first web app for small groups running shared fitness
challenges. The immediate use case is an official monthly challenge planned in
advance by a small friend group, then published for anyone in the group to
follow from their phone.

The rebuilt product should make the daily experience clearer and more useful
than the current app. Users should quickly understand what the current
challenge is about, what to do today, what is coming over the next few days,
and how far they are through the challenge. The product should also leave room
for future personal and private challenge modes without requiring another full
database redesign.

## Current Product Problem

The current app is built around a single `Days` table with one row per date and
comma-separated exercises. That structure is too limited for the next version
of the product because it:

- mixes challenge definition with scheduled calendar data
- stores exercises as one text blob instead of structured items
- cannot represent multiple challenge runs cleanly
- cannot track edits to future days without mutating history
- cannot support personal progress, self-paced runs, or private challenge modes

The current UI also overemphasizes the month grid. For a mobile-first product,
the daily workflow should come before the calendar.

## Product Model

The rebuilt product should use these core concepts.

### Challenge Template

A reusable plan definition. This holds the challenge identity and reusable
content, such as title, description, duration, and high-level positioning.

Examples:

- March Core Challenge
- 30-Day Mobility Reset

### Challenge Run

A scheduled instance of a challenge template. This is the official event people
participate in at a specific time.

For Phase 1, the app should support one public official monthly challenge run
at a time. The schema should still support more than one run later.

### Challenge Day

A single day within a run. It contains the daily goal, summary, notes, expected
duration, rest-day status, and the exercises for that day.

### Exercise

A structured exercise row attached to a challenge day. This allows per-exercise
details such as sets, reps, timed work, rest, notes, and substitutions.

### User Progress

Per-user completion data. This is intentionally deferred from the database in
Phase 1. Until authentication exists, progress is stored locally on the device.

## Challenge Modes

The product should eventually support more than one usage mode, but those modes
should share one underlying model instead of becoming separate products.

### Phase 1

- Official monthly challenge only
- Public experience
- One active run surfaced in the UI
- Organizer-managed content through Supabase SQL

### Future Modes

- Personal self-paced challenge
- Private or custom group challenge
- Organizer-created custom runs with dedicated participants

These later modes should reuse the same model of template, run, day, and
exercise.

## Phase 1 MVP

### Product Boundaries

Phase 1 is a documentation-driven rebuild target with these product decisions:

- public, mobile-first site
- one official monthly challenge run at a time
- no authentication
- no admin UI
- challenge content managed directly in Supabase SQL
- local per-device progress only

### Information Hierarchy

The mobile home screen should prioritize the daily flow:

1. Challenge intro
2. Today card
3. Next 3 days
4. Progress block
5. Calendar
6. Day details sheet or modal

The calendar remains part of the product, but it is not the primary first view.

### Day States

The product should use clear user-facing day states:

- `today`: the current challenge day
- `upcoming`: future planned day
- `elapsed`: a past scheduled day with no local completion mark
- `done_local`: a day marked complete on the current device

Past days must not be treated as automatically completed.

### Content Visibility

Users should be able to inspect the full month of the official challenge in
Phase 1. Full visibility supports planning, group discussion, and deciding how
to prepare for upcoming days.

### Progress Model

Phase 1 should track two kinds of progress:

- schedule progress: where the user is in the challenge timeline
- local completion progress: what this device has marked as done

Local completion data should be stored in browser storage and scoped by the
challenge run slug so different runs do not overwrite each other.

### Editing Rules

Organizers may change future days after the challenge starts. Those edits should
be visible in the UI with an `Updated` badge and a short change note so users
can understand that the plan changed.

Past days should remain historically frozen from the product perspective. New
edits should not silently rewrite what users saw on earlier days.

### Rest Days

Rest and recovery days must be explicit planned content. They should not appear
as empty or missing entries.

## UX Direction

The rebuilt product should feel useful for a user arriving from a phone and
opening it quickly during the day.

### Home Experience

- short challenge summary with duration and intent
- prominent today card with notes and exercises
- next 3 days preview to reduce surprise
- compact progress section showing day number and completion count
- calendar lower on the page for broader planning

### Day Details

Opening any day from the home feed or calendar should show:

- day title
- short summary
- notes or coach message
- exercise list with structure
- substitutions where relevant
- update note if that day was changed after publish

### Calendar Role

The calendar should act as navigation and planning support rather than the main
surface. It should help users scan the month and jump into a day, not compete
with the today flow.

## Data Model Direction

The existing `Days` table should be replaced by a more structured model.

### Phase 1 Tables

#### `challenge_templates`

Stores reusable challenge definitions.

Suggested fields:

- `id`
- `slug`
- `title`
- `description`
- `duration_days`
- `difficulty`
- `cover_note`
- `is_published`

#### `challenge_runs`

Stores scheduled public or private instances of templates.

Suggested fields:

- `id`
- `template_id`
- `slug`
- `starts_on`
- `ends_on`
- `status`
- `title_override`
- `description_override`

#### `challenge_days`

Stores the day-level schedule and notes for a specific run.

Suggested fields:

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

#### `day_exercises`

Stores ordered exercise rows for each day.

Suggested fields:

- `id`
- `challenge_day_id`
- `position`
- `name`
- `sets`
- `reps`
- `duration_seconds`
- `rest_seconds`
- `notes`
- `substitution`

### Later Tables

These are intentionally deferred until authentication and personal progress are
introduced:

- `profiles`
- `user_run_progress`
- `user_day_progress`

## Content Management Rules

Phase 1 content operations should follow these rules:

- organizers create and update content directly in Supabase SQL
- the app remains public-facing only
- future days may be edited
- future edits should be surfaced to users as updates
- past-day history should not be silently rewritten in the product model
- every day should have intentional content, including rest days

## Roadmap

### Phase 1: Public Rebuild

- create project documentation for the new product direction
- replace the flat `Days` table design with the new structured schema
- rebuild the UI as a mobile-first daily experience
- add local progress persistence keyed by challenge run slug
- support one official monthly challenge run in the public UI

### Phase 2: Personal Progress

- add authentication
- add per-user progress in Supabase
- add join flow for official runs
- add self-paced personal challenge runs
- move progress from local-only to signed-in persistence

### Phase 3: Flexible Challenge Modes

- add private and custom challenge runs
- add a simple admin panel for challenge data management
- expand organizer tools for challenge creation and editing
- add notifications and reminders
- add richer analytics and progress summaries

## Implementation Sequence

Once implementation begins, the work should happen in this order:

1. Create `docs/` and store product planning documents there.
2. Update the repository roadmap to match the new phased direction.
3. Design the Supabase schema and seed data for one official monthly run.
4. Refactor frontend data access around active run, days, and exercises.
5. Rebuild the UI around the mobile-first day flow.
6. Add local progress persistence keyed by run slug.

## Defaults And Assumptions

- No code changes are included in this documentation step.
- Phase 1 surfaces one active official monthly challenge in the UI.
- The schema is intentionally broader than the first shipped UI.
- Challenge content remains public in Phase 1.
- Device-local progress is acceptable until authentication ships.
