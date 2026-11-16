# Architecture

## Runtime

Fit is a Vite SPA with React and TypeScript. [main.tsx](../src/main.tsx)
mounts `App` in StrictMode. wouter uses hash routes: `#/weight`,
`#/exercises`, `#/exercises/:id`, `#/trainings/:id` and `#/settings`; other routes redirect to
Weight. There is no backend, authentication or sync.

The app's hash-location hook in `src/lib/navigation/` keeps view and period
parameters inside the fragment, for example `#/weight?view=weeks&end=2026-10-19`
or `#/exercises?view=library&archived=1`. It supplies path and raw search separately
to avoid decoding nested return paths twice. A weight week opens through
`view=week&week=YYYY-MM-DD`, with the overview window retained in `end`.
Detail links carry validated in-app `from` paths. Main tabs remember the last
overview URL; temporary scroll and focused-link positions restore after live
data is ready. Period changes replace history, while opening details pushes it.

`AppShell` renders inside the router. Its header stays fixed at the top; the
Weight and Exercises tabs switch sections. The shared
[PeriodPager](../src/components/period-pager/period-pager.tsx) handles touch/pen
drags only inside period headers and charts, or the training week summary.
It uses pointer events and allows vertical panning and pinch zoom. It ignores
edge starts, controls, vertical moves and open sheets, cancels on multitouch,
and suppresses a drag's follow-up click. Mouse and keyboard users use the
same visible arrows. Only the current panel is accessible; adjacent panels
are inert and hidden from assistive technology. Period state commits at
release while the track settles. Lists stay outside the moving panels.

Shared motion values live in `src/index.css`. Tab indicators measure the selected
control and follow size changes; saved-row feedback alternates CSS animations
without remounting inputs or delaying writes. Screens fade after live data loads.
Sheets keep native dialog focus and immediate dismissal. Reduced motion removes
automatic transitions while leaving direct pointer tracking responsive.

`ToastProvider` sits above the routes. Each screen is inside
[DatabaseGate](../src/components/database-gate/database-gate.tsx), which
opens IndexedDB. `StorageErrorBoundary` catches failed live reads as well as
render errors; the header navigation remains available. `GenerationScope`
observes the data generation and keys its children by it. Restore and wipe
therefore remount screens, close sheets and discard edit state. Action toasts
are dismissed; ordinary messages can remain.

Screens read repositories through `useLiveQuery` from dexie-react-hooks.
Forms keep their own input state and await repository writes before reporting
success. Derived summaries and chart data stay outside the database.

## Database and writes

[db.ts](../src/lib/db/db.ts) defines the `fit` Dexie database, schema version
3. Version 2 gives existing exercises the `total` progress view. Version 3 adds
trainings and links existing sets to one training per recorded date. It preserves
original set fields, ids and timestamps, including records for missing or
archived exercises. IndexedDB stores these tables:

| Table | Primary key | Other indexes / purpose |
| --- | --- | --- |
| `weightEntries` | `id` | Unique `date` |
| `exercises` | `id` | Exercise name, metric, permanent lock, selected load, progress view, archive date |
| `sets` | `id` | `exerciseId`, `trainingId`, `date`, `[exerciseId+date]` |
| `trainings` | `id` | `date`; optional name and note |
| `settings` | `key` | `goalWeightKg` and `lastExportAt`; missing records use null defaults |
| `meta` | `key` | Internal `dataGeneration`, defaulting to zero |

New weight entries, exercises, trainings and sets get UUIDs and UTC ISO created/updated
timestamps. Dates are local `YYYY-MM-DD` keys, not UTC instants. Date helpers
validate calendar dates and do calendar arithmetic; `useToday` refreshes once
a minute and when the page becomes visible.

[Repositories](../src/lib/db) enforce these rules:

- One weight per date. Saving an occupied date replaces its values. Moving
  an existing entry onto another entry's date removes the occupant in the
  same transaction and keeps the moved entry's id.
- Body and goal weights use tenths of a kg; set loads and selected loads use
  hundredths. Rounded values must still be finite and positive. Reps and
  seconds are positive safe integers; unused metric fields are null, so a
  `session` set stores no values.
- The first set and `metricLockedAt` are written together. The lock remains
  after every set is deleted. Archived exercises keep their history, but
  adding or editing their sets is refused.
- Every set belongs to a training on the same local date. A first entry can
  create its training in the same transaction. Several trainings on a date
  require an explicit target. Moving a training moves its entries atomically,
  and is refused if a child exercise is archived. An empty training without
  a name or note is removed when its last entry leaves.
- Training-delete undo restores the whole group only if its ids are vacant,
  existing exercises still fit, and the generation is unchanged. Entry undo
  restores a parent removed by that same delete, but never one deleted later.
  Undo can restore archived exercise history.
- Delete undo restores the original record only if its id is vacant. Weight
  undo also needs a vacant date; set undo requires a matching metric when its
  exercise exists and preserves legacy orphan records otherwise. Archive undo
  checks the archive timestamp, and repeat-set undo checks that the set's payload
  is unchanged.
- All undo operations check the captured generation inside their write
  transaction. Restore and wipe increment it in the same transaction as the
  data change, preventing old undo actions from changing replacement data.

## Derived data and charts

[Stats](../src/lib/stats) calculate weight summaries, changes between entries,
weekly weight averages in Monday-based weeks with the 12-week windows of the
Weeks view, daily exercise bests, daily totals and distinct active days in a Monday-based
week. Missing days are omitted. Each exercise stores a progress view, `total`
(default) or `best`; the detail sentence and chart both use that daily
series. A `session` exercise is always `total`, and its day total
is the number of sessions that day. Weighted progress uses one exact selected load for both
views; if that load has no sets, it falls back to the latest set's load.
The detail sentence, chart and best-set highlights share it.
Best-set highlights always mark the daily best. Progress text compares the
latest day with the first and names a higher historical record separately.

The Exercises Week view groups records by their explicit training, newest days
first, including archived exercise history. Session frequency stays separate
from the number of training groups. Training summaries keep weighted reps at
different loads separate and never combine different metrics. A name-less
training uses its session exercise names as a title, or “Training” when none
exist. `getTrainingDayCounts` counts the trainings with at least one entry on
each day of a week; the week chart and its training total both use it, so a
training left without entries stays listed but is not counted. Library lists
active exercises alphabetically, each with a summary of its latest training.
Legacy entries whose exercise is missing remain visible as “Unknown exercise”
in training detail. They are read-only individually; deleting their training
still removes the complete group and Undo restores the orphan rows unchanged.
Migration never cleans them up.

[Chart helpers](../src/lib/charts) map real calendar days to x coordinates
or to day/week slots, pad value domains and generate ticks and SVG points.
Full charts use a nonnegative domain, visible raw points or bars and a text
readout with keyboard selection. The exercise `total` view draws a bar chart
from `getProgressBars`, which ends at today and switches to
weekly bars over 60 days, or always for sessions; the `best` view and weight use line charts. See the [chart rules](roadmap.md#chart-rules)
for sparse data and the Month/Weeks/All goal-line behavior.

## Backup and storage

[Backup](../src/lib/backup) exports the five data tables in one readonly
transaction, excluding `meta`. Files use `app: "fit"`, `schemaVersion: 4`
and the name `fit-YYYY-MM-DD.json`. Schema 3 added the `session` metric;
schema 4 adds trainings. Schema 1, 2 and 3 files still import; schema 1
exercises get the `total` progress view. Older files receive one training per
recorded date after validation, using the same conversion as the database
upgrade, so preview counts match the restore. Schema 4 validates training
references and matching dates. Parsing has no writes: it validates exact
fields, values, ids, dates, references, metric locks and settings, and returns
at most 20 errors. Timestamps must match `toISOString()` form so string-based
ordering remains valid. Invalid values are rejected, never rounded on import.

Settings validates a selected file before showing its name, date and counts.
Only the latest file read may publish a preview or error. Confirmation fully
replaces the data in one transaction over the five tables plus `meta`;
failure rolls everything back. Wipe clears those tables and increments the
generation. The storage helper reports persistent-storage support and asks
for it when requested; JSON backups remain separate from that browser choice.

Never lower the Dexie schema version; a rollback release keeps the current
schema. Another window upgrading the database closes this connection and shows
a Reload notice. A blocked upgrade asks the user to close other Fit windows.
Neither path resets or deletes the database.

## PWA updates

`vite-plugin-pwa` (configured in [vite.config.ts](../vite.config.ts)) uses
`generateSW` with `registerType: "prompt"` and `injectRegister: false`. The
service worker precaches the app shell and bundled assets (`js`, `css`,
`html`, `svg`, `png`, `woff2`), so a reload works offline after the first
visit; user records remain in IndexedDB. Only the Latin `woff2` files of Geist
and Geist Mono are loaded, through the `@font-face` rules in
[src/index.css](../src/index.css), to keep the precache small.

[UpdateBanner](../src/components/update-banner) registers the worker with
`useRegisterSW`. When a new version is waiting, it shows a banner under the
header with Reload and Later. Nothing reloads until Reload is tapped, so an
entry that is being typed is never lost; an open sheet is modal and covers
the banner until it closes. Reload activates the waiting worker and reloads
the page.

The manifest uses the name "Fit", `start_url: "/#/weight"`, the warm ground
color for theme and background, and the icons in [public](../public).
