# Architecture

## Runtime

Fit is a Vite SPA with React and TypeScript. [main.tsx](../src/main.tsx)
mounts `App` in StrictMode. wouter uses hash routes: `#/weight`,
`#/exercises`, `#/exercises/:id` and `#/settings`; other routes redirect to
Weight. There is no backend, authentication or sync.

`AppShell` renders inside the router. Its header stays fixed at the top, and
a one-finger horizontal swipe on `<main>` switches between exactly
`#/weight` and `#/exercises`; other routes ignore it. The
[swipe hook](../src/lib/gestures/use-horizontal-swipe.ts) uses native touch
events, so normal scrolling and `touch-action` stay untouched. It ignores
vertical moves, multitouch, starts near the screen edge (iOS Back), form
controls and open sheets, and it suppresses the tap that would follow a
recognized swipe.

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
2. Version 2 gives existing exercises the `total` progress view. IndexedDB
stores these tables:

| Table | Primary key | Other indexes / purpose |
| --- | --- | --- |
| `weightEntries` | `id` | Unique `date` |
| `exercises` | `id` | Exercise name, metric, permanent lock, selected load, progress view, archive date |
| `sets` | `id` | `exerciseId`, `date`, `[exerciseId+date]` |
| `settings` | `key` | `goalWeightKg` and `lastExportAt`; missing records use null defaults |
| `meta` | `key` | Internal `dataGeneration`, defaulting to zero |

New weight entries, exercises and sets get UUIDs and UTC ISO created/updated
timestamps. Dates are local `YYYY-MM-DD` keys, not UTC instants. Date helpers
validate calendar dates and do calendar arithmetic; `useToday` refreshes once
a minute and when the page becomes visible.

[Repositories](../src/lib/db) enforce these rules:

- One weight per date. Saving an occupied date replaces its values. Moving
  an existing entry onto another entry's date removes the occupant in the
  same transaction and keeps the moved entry's id.
- Body and goal weights use tenths of a kg; set loads and selected loads use
  hundredths. Rounded values must still be finite and positive. Reps and
  seconds are positive safe integers; unused metric fields are null.
- The first set and `metricLockedAt` are written together. The lock remains
  after every set is deleted. Archived exercises keep their history, but
  adding or editing their sets is refused.
- Delete undo restores the original record only if its id is vacant. Weight
  undo also needs a vacant date; set undo needs an existing exercise with a
  matching metric. Archive undo checks the archive timestamp, and repeat-set
  undo checks that the set's payload is unchanged.
- All undo operations check the captured generation inside their write
  transaction. Restore and wipe increment it in the same transaction as the
  data change, preventing old undo actions from changing replacement data.

## Derived data and charts

[Stats](../src/lib/stats) calculate weight summaries, changes between entries,
daily exercise bests, daily totals and distinct active days in a Monday-based
week. Missing days are omitted. Each exercise stores a progress view, `total`
(default) or `best`; the list sentence, sparkline and detail chart all chart
that daily series. Weighted progress uses one exact selected load for both
views; if that load has no sets, it falls back to the latest set's load.
The list sentence, sparkline, detail chart and best-set highlights share it.
Best-set highlights always mark the daily best. Progress text compares the
latest day with the first and names a higher historical record separately.

[Chart helpers](../src/lib/charts) map real calendar days to x coordinates
or to day/week slots, pad value domains and generate ticks and SVG points.
Full charts use a nonnegative domain, visible raw points or bars and a text
readout with keyboard selection. The exercise `total` view draws a bar chart
and bar sparkline from `getTotalBars`, which ends at today and switches to
weekly bars over 60 days; the `best` view and weight use line charts.
Sparklines are passive. See the [chart rules](roadmap.md#chart-rules)
for sparse data and the Month/All goal-line behavior.

## Backup and storage

[Backup](../src/lib/backup) exports the four data tables in one readonly
transaction, excluding `meta`. Files use `app: "fit"`, `schemaVersion: 2`
and the name `fit-YYYY-MM-DD.json`. Schema 1 files still import; their
exercises get the `total` progress view. Parsing has no writes: it validates exact
fields, values, ids, dates, references, metric locks and settings, and returns
at most 20 errors. Timestamps must match `toISOString()` form so string-based
ordering remains valid. Invalid values are rejected, never rounded on import.

Settings validates a selected file before showing its name, date and counts.
Only the latest file read may publish a preview or error. Confirmation fully
replaces the data in one transaction over the four tables plus `meta`;
failure rolls everything back. Wipe clears those tables and increments the
generation. The storage helper reports persistent-storage support and asks
for it when requested; JSON backups remain separate from that browser choice.

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
