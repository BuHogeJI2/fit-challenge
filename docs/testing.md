# Testing

## Commands

Run from the repository root after `pnpm install`:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec vitest run src/test/backup.test.ts
pnpm exec vitest
pnpm test:browser
pnpm build
```

`pnpm test` runs the full suite once; `pnpm exec vitest` starts watch mode.
Typecheck uses `tsc -b`; build also typechecks before producing `dist/`.
`pnpm test:browser` runs the Playwright tests in `e2e/` against a Vite dev
server in mobile Chromium; it needs the Chromium build for its Playwright
version (`pnpm exec playwright install chromium`).

## Setup

[vite.config.ts](../vite.config.ts) configures Vitest with jsdom. React Testing
Library and user-event exercise the rendered app. [setup.ts](../src/test/setup.ts)
loads fake-indexeddb and jest-dom matchers. It also supplies `showModal()` and
`close()` for jsdom's native dialog element, including its `close` event.
This shim does not implement browser focus trapping, Escape or backdrop
behavior.

Repository tests use [resetDatabase](../src/test/db-test-utils.ts) to delete
and reopen the test database with automatic opening enabled. Time-sensitive
tests freeze the clock and restore timers afterward. Async UI checks wait
for the resulting row, message or readout rather than assuming a click has
finished the IndexedDB write and live-query render.

## Coverage map

All files below are in `src/test/`:

| Files | Main coverage |
| --- | --- |
| `app.test.tsx` | Hash routing, fallback route, top-tab navigation, and no section switching from content swipes |
| `period-pager.test.tsx` | Embla adapter: settle/commit/recenter, parent refusal, interruption cleanup, inert neighbors, touch exclusions and reduced motion |
| `navigation.test.tsx` | Hash queries, direct week links, daily week history, invalid parameters, nested return paths, and section/scroll/focus restoration |
| `weight.test.tsx` | First entry, editing, date replacement, delete/undo, storage failures, months, weeks and chart selection |
| `exercises.test.tsx` | Exercise lifecycle, metric forms, sessions, repeat today or into a past day/undo, history, load and progress-view selection, day/week total bars and short-series charts |
| `training-week.test.tsx`, `training-entry.test.tsx`, `training-stats.test.ts` | Weekly training groups, the A–Z library, explicit target choice, fixed-target logging, moving/splitting, whole-training delete/undo, separate metrics and loads |
| `training-repo.test.ts`, `training-migration.test.ts`, `database-notice.test.tsx` | Training invariants and undo, real v1/v2 upgrades, record preservation, rollback/retry, and multi-window update notices |
| `settings.test.tsx` | Goal, export, restore preview/confirmation, wipe, generation reset, persistence UI and file-read races |
| `weight-repo.test.ts`, `exercise-repo.test.ts`, `settings-repo.test.ts` | Write invariants, rounding, metric locks, archive rules, undo guards and transaction rollback |
| `backup.test.ts` | Strict parsing, schemas 1–3 import, schema 4 round-trips, snapshot export, full replacement, rollback, wipe and stale undo |
| `dates.test.ts`, `use-today.test.tsx` | Real dates, leap years, calendar arithmetic, week/month boundaries and day refresh |
| `numbers.test.ts`, `exercise-text.test.ts`, `weight-format.test.ts` | Decimal/duration input, precision, progress wording, date context and axis labels |
| `stats.test.ts` | Weight summaries, weekly averages, first/last and within-week change, windows, daily bests, selected loads, grouped totals and active days |
| `charts.test.ts`, `bar-chart.test.tsx` | Date spacing, day/week slots, padded domains, nonnegative floors, ticks, bars, the training week chart and sparse SVG output |
| `update-banner.test.tsx` | The new-version banner reloads only on Reload and hides on Later (the service worker itself is mocked) |

## Limits and manual checks

`e2e/period-pager.e2e.ts` sends real touch input through the Chrome DevTools
Protocol and exercises the real Embla engine. It checks tracking before release,
row-start swipes and taps, repeated boundary/reverse swipes in all four period
views, vertical scrolling, arrow navigation, empty months and reduced motion.
Pager unit tests mock Embla events to check the settle/select bridge, including
zero-duration event ordering. Other UI tests use the arrows without a carousel
engine. Neither proves touch behavior.
Chromium coverage does not replace an installed iOS app check. fake-indexeddb does not
prove behavior under browser storage limits, eviction or private browsing.
Mocked downloads and persistence responses do not prove that a browser saved
a file or granted persistence.

On a phone, check sheet focus/return, Escape or Back, the keyboard, scrolling
and safe-area spacing. Try comma decimal input, backdated entries and the
Minutes/Seconds fields. Export and restore a real file, including Cancel and
an invalid file. Check storage support and refusal states.

Scroll a long history: the header stays on top and focused rows are not
hidden under it. Switch Weight and Exercises through the top tabs. Swipe
inside month/week headers, charts and history rows: only the period changes.
A plain tap must still open the row. Unavailable periods resist and return to
the same period, and an immediate reverse swipe must work.
Repeat boundary/reverse swipes and interrupt a drag by switching apps, then
check swipes and arrows again. Vertical scrolling, pinch zoom, the exercise picker in
the set sheet and the browser's edge Back gesture must keep working.

Turn on reduced motion: arrows should change periods immediately, while direct
dragging still follows the finger. Check the segmented control pill after text/font size
changes, screen and disclosure fades, sheet entrance and immediate close, and
saved-row emphasis after repeated saves and Undo. Keyboard focus must stay
visible and usable throughout; animations must not delay logging.

Before a migration release, export a real backup and open the new build against
an existing database. Compare record counts and values, then export and restore
the new backup. With two Fit windows, verify the reload/blocked notices without
resetting storage. Automated migration fixtures check rollback and preservation,
but do not replace these browser checks.

Check installation, offline reload after the first online visit and an
update between two production builds: the banner appears, Later hides it, and
Reload loads the new version with the data still there. These PWA and phone checks are
manual, not covered by jsdom.
