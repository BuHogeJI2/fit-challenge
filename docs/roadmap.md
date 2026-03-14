# Roadmap

## Current Status

Phase 1 is implemented as a public mobile-first challenge experience:

- the app loads one featured run from Supabase
- challenge content is normalized in `src/lib/challenge/`
- device-local completion is scoped by run slug
- the main screen includes hero, featured day, upcoming days, progress,
  calendar, and day-details sheet
- the repo has baseline Vitest coverage

## Near-Term Follow-Ups

### Testing

- Add direct tests for `pickFeaturedRun()` and `buildChallengeViewModel()`.
- Cover loading, scheduled, active, and completed UI states more explicitly.
- Add interaction coverage for marking done from the day-details sheet.

### Product Polish

- Add a retry affordance for transient load failures.
- Revisit post-run messaging and summary behavior for completed runs.
- Document any real Supabase seeding workflow once SQL or migration files are
  added to the repo.

### Future Product Phases

- Add authenticated user progress synced to Supabase.
- Support self-paced and private runs on top of the same template/run/day model.
- Add organizer tooling for challenge authoring and schedule edits.
