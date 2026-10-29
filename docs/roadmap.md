# Roadmap

## Product

A personal fitness tracker for one person. It has two separate modes with a
switch between them:

- **Weight**: log body weight, look back by date, compare values, and see how
  it changes on a chart.
- **Exercises**: keep your own list of exercises, log sets (reps, weight,
  time), and see whether the numbers grow.

The app is mobile first, works offline, and is installable on the home screen.
It has one theme and English only.

## Fixed Decisions

- **No auth, no backend.** Data lives in the browser (IndexedDB) on the
  device. The app never waits for the network to show data.
- **Backup is a file.** Versioned JSON export, and import as a full restore
  that replaces all data. The app shows the date of the last export.
- **Name and origin.** The app is called Fit and is served at
  `https://fit.buhogeji.me/`. Browser data belongs to one origin (domain), so
  moving to another one later needs an export and import.
- **Supabase is removed** from the app. It can come back later as an optional
  sync layer (see Phase 3), but the local database stays the source of truth.
- **Design:** the "Journal" composition — month-first weight view, dated
  record lists, sentence-style entry forms, warm monochrome palette
  (`#F3F2EE` ground, `#222222` ink, `#66655F` muted) — with Geist and Geist
  Mono for all text and numbers. No serif.
- **Charts are hand-made SVG.** No chart library.
- **Fresh start.** The old public challenge app (challenge runs, days,
  Supabase tables, Radix sheets, confetti) is removed. No data migration.

## Chart Rules

These apply to every full-size chart in the app:

- X axis uses real date spacing. Recorded points are joined by straight
  lines; no values are invented between them, and missing days are never
  zeros.
- Raw values stay visible. A derived line never hides the points.
- Axes and units are labelled.
- Tapping a point shows its date and value as text; the same data is
  readable in the list below the chart, so nothing needs dragging.
- Zero records show an empty state, one record shows a single dot, and a
  flat series still gets a readable scale.
- When there is not enough data for a chart or a trend, say so instead of
  drawing a misleading line.
- The goal line never squeezes the data. The month view keeps the scale on
  the month's own values and draws the goal only when it falls inside that
  range; the all-time view widens the scale to include the goal. The goal
  number is always shown next to the chart.

Sparklines in lists are simplified: no axes and no tapping, but the same
date spacing and the same metric as the full chart they lead to.

## MVP (v1.0)

### Weight

- Log weight with date (default today, can backdate), value in kg and an
  optional note.
- One entry per local date. Saving a date that already has an entry replaces
  it, and the form says so.
- Decimal input accepts both `83.4` and `83,4`.
- Edit and delete an entry. Delete can be undone.
- Month view: month chart with dated points, previous / next month, and a
  month summary (count, average, range).
- All-time view: the whole history on one chart.
- Journal list under the chart: entries newest first, each with its change
  from the previous entry and its note.
- Header numbers: latest weight with its date, change since the first entry,
  and distance to the goal when a goal is set.
- Optional goal weight, shown as a labelled line on the chart.

### Exercises

- Create, rename and archive exercises. Archived exercises keep their
  history and can be restored.
- Each exercise has one metric: `reps`, `reps + weight` or `time`. The metric
  is fixed once the exercise has a logged set.
- Log a set: date (default today, can backdate), the values its metric needs,
  and an optional note. The form is prefilled from the last set, with a
  "Repeat last" action that logs it today. Each day in the history can also
  repeat its own last set into that day, for filling in a past workout.
- Edit and delete a set. Delete can be undone.
- Exercises list: each exercise with a sparkline, a one-line progress
  sentence (for example "Best day 30 reps, up 20 since Aug 3") and the date
  of the last set.
- Exercise detail: chart of each day's value and the history grouped by date,
  with each day's sets and total. A per-exercise toggle picks the value:
  **Day total** (the default: all reps; reps at the chosen weight for
  `reps + weight`; total hold for `time`) or **Best set** (most reps; most
  reps at the chosen weight; longest hold). Three sets of 10 count as 30 in
  the day total and 10 as the best set.
- The sparkline, the progress sentence and the detail chart all use the
  exercise's selected view and, for `reps + weight`, the same selected weight,
  named in the text ("reps at 24 kg").
- "This week" summary: number of active days.

### Data and App

- IndexedDB through Dexie with a versioned schema. Every record has a stable
  UUID and created / updated timestamps.
- Saving means the local write succeeded. Errors are shown, never swallowed.
- Export all data, settings included, to a versioned JSON file.
- Import is a full restore. It first validates the whole file (schema
  version, every record, duplicate ids, one weight per date, exercise
  references), shows a preview with counts, and offers to export the current
  data. After confirmation it replaces everything in one transaction. A
  failed import changes nothing.
- Ask for persistent storage (`navigator.storage.persist()`) and show the
  result in Settings.
- Settings: goal weight, export / import, last export date, storage status,
  delete all data.
- Clear states for empty data, a single record, and a storage error.
- PWA: web manifest, icons, and an offline app shell with bundled fonts, so a
  reload works offline after the first visit.
- Tests: Vitest for domain logic (stats, chart scales, import validation,
  date handling) and React Testing Library for the main flows, with an
  in-memory IndexedDB.

Phase 2 and Phase 3 are independent. Either can come first.

## Phase 2: Insights

- Weight trend line (7-day average over a calendar window) and weekly rate.
- Compare any two dates or two periods.
- Exercise volume and weekly totals charts.
- Personal records list and streaks.
- Reorder exercises; exercise notes.
- Export reminder when the last export is old.
- CSV export.

## Phase 3: Optional Sync

Only if multi-device use or automatic backup becomes necessary. It needs a
one-owner sign-in, so it is a separate decision.

- Single owner sign-in (for example Supabase Auth) with row-level security.
- Local database stays the source of truth; sync runs in the background.
- Writes go to a local outbox in the same transaction as the record, with
  stable operation ids and retries.
- Server writes check the expected row revision and return a new one.
  Same-row conflicts are shown to the user, not silently overwritten.
- Full pull of the owner's data (it is small), including tombstones.
- Sync starts on launch, on focus, on reconnect and after local writes.
  An expired session pauses sync and never hides local data.

## Later Ideas

Not planned yet. Collected so they are not lost.

- Projected goal date (needs a defined trend model first).
- Several separate workouts on one day.
- Workout routines or templates.
- Rest timer between sets.
- Distance metric (running, walking).
- Estimated one-rep max for weighted exercises.
- Activity calendar heatmap.
- Body measurements (waist, chest, and so on).
- Pounds as a unit.
- Reminders and notifications.
- Import from Apple Health or other trackers.

## Out of Scope

- Multiple users, social features, sharing.
- Multiple themes or languages.
- A server or API of our own.
