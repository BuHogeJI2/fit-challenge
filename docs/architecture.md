# Architecture

## Current Shape

The app is a single-screen SPA that renders one featured challenge run. The
architecture is intentionally simple:

- Supabase is the remote source of truth for challenge content.
- React local state manages UI selection and per-device progress.
- Derived view-model logic lives in `src/lib/challenge/challenge.utils.ts`.
- Presentational components stay focused on rendering and callbacks.

## Runtime Flow

### App Boot

- `src/main.tsx` mounts `ChallengeApp`.
- `ChallengeApp` is the only screen-level coordinator in the current app.

### Remote Data Load

- `useFeaturedChallenge()` triggers `fetchFeaturedChallenge()` on mount.
- `fetchFeaturedChallenge()` first loads candidate runs with statuses
  `scheduled`, `active`, and `completed`.
- `pickFeaturedRun()` selects the run to surface:
  - active runs first
  - then upcoming scheduled runs
  - then the most recent completed run
- After selection, the loader fetches the related template, ordered days, and
  ordered exercises.
- Rows are normalized into camelCase frontend models before they reach the UI.

### Local Progress

- `useLocalChallengeProgress(runSlug)` reads from and writes to
  `localStorage`.
- Storage keys use the `fit-challenge-progress:<runSlug>` format.
- Progress is keyed by challenge day number inside each run bucket.
- Marking a day done stores a timestamp; undo removes the entry entirely.

## Derived UI State

`buildChallengeViewModel()` produces the UI-facing model from challenge content,
the current date, and local progress.

### Run Phase

- `before`: current date is before `starts_on`
- `during`: current date is inside the run window
- `after`: current date is after `ends_on`

### Day State

- `today`: the calendar day matches today and is not locally complete
- `upcoming`: future day
- `missed`: past unfinished day
- `done_local`: day marked complete on this device

### Screen Derivations

- `featuredDay`: day 1 before the run, today during the run, final day after
  the run
- `nextDays`: next three upcoming days after the featured day
- `calendarMonths`: month-grouped calendar sections with weekday offsets
- `scheduleCompletedDays`: timeline progress based on dates, not local marks
- `localCompletedDays`: count of locally completed days for the current run

## UI Composition

The main screen order matches the current product contract:

1. Challenge hero
2. Featured day card
3. Next 3 days
4. Progress summary
5. Calendar
6. Day details sheet
7. Exercise tracker sheet

`ChallengeApp` owns:

- the selected day id for the informational day sheet
- the selected tracked day id
- the selected tracked exercise id

It passes small callback props down to child components and swaps between the
day review sheet and the focused tracker sheet as needed.

### Current Surface Roles

- `FeaturedDayCard`: primary interactive surface for the current featured day.
  Actionable exercises open the focused tracker directly.
- `UpcomingDays`: passive preview cards for the next three upcoming days,
  showing date context plus each exercise target.
- `ChallengeCalendar`: browse-and-open navigation only. Calendar taps open the
  day review sheet and do not leave a selected action state behind.
- `DayDetailsSheet`: informational review surface for any opened day. It shows
  day metadata, notes, and exercise targets only.
- `ExerciseTrackerSheet`: the only exercise-level editing surface. It supports
  both direct featured-day tracking and past-day recovery flows.
- Past actionable days (`missed` and past `done_local`) expose `Track sets` and
  `Mark done` / `Undo completion` from the bottom of the day sheet. `Track
  sets` hands off into the focused tracker sheet for that day.

## Accessibility And Interaction Notes

- Interactive day surfaces are semantic `button` elements.
- Calendar cells expose descriptive `aria-label` values.
- The day details and exercise tracker surfaces use `@radix-ui/react-dialog`.
- Status is expressed with labels and text, not color alone.

## Error And Empty Handling

`ChallengeApp` branches into dedicated states for:

- loading
- Supabase request failure
- no featured run returned
- successful render

There is no retry button yet; reloading the page reruns the fetch flow.
