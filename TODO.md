# TODO

## Phase 1: Public Rebuild

- Create `docs/product-plan.md` as the source of truth for the rebuild.
- Design the new Supabase schema around templates, runs, days, and exercises.
- Seed one official monthly challenge run in Supabase.
- Rebuild the app as a mobile-first public experience.
- Prioritize the home flow around the challenge intro, today card, next 3 days, progress block, and calendar.
- Add local per-device progress tracking keyed by challenge run slug.
- Surface future day changes with an `Updated` badge and change note.

## Phase 2: Personal Progress

- Add authentication and profile support.
- Persist user progress in Supabase instead of device-only storage.
- Add join flow for official challenge runs.
- Support self-paced personal challenge runs.
- Add richer progress tracking such as streaks and completion summaries.

## Phase 3: Flexible Challenge Modes

- Add private and custom challenges.
- Add organizer tools for creating and editing challenge content.
- Add workout templates, validation, and richer content editing.
- Add reminders and notifications.
- Add analytics and progress insights.
