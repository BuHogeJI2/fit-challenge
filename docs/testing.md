# Testing

## Commands

Run from the repository root after `pnpm install`:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec vitest run src/test/backup.test.ts
pnpm exec vitest
pnpm build
```

`pnpm test` runs the full suite once; `pnpm exec vitest` starts watch mode.
Typecheck uses `tsc -b`; build also typechecks before producing `dist/`.

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
| `app.test.tsx` | Hash routing, fallback route, mode navigation and tab swipe rules |
| `weight.test.tsx` | First entry, editing, date replacement, delete/undo, storage failures, months and chart selection |
| `exercises.test.tsx` | Exercise lifecycle, metric forms, repeat today or into a past day/undo, history, load selection and short-series charts |
| `settings.test.tsx` | Goal, export, restore preview/confirmation, wipe, generation reset, persistence UI and file-read races |
| `weight-repo.test.ts`, `exercise-repo.test.ts`, `settings-repo.test.ts` | Write invariants, rounding, metric locks, archive rules, undo guards and transaction rollback |
| `backup.test.ts` | Strict parsing, round-trip, snapshot export, full replacement, rollback, wipe and stale undo |
| `dates.test.ts`, `use-today.test.tsx` | Real dates, leap years, calendar arithmetic, week/month boundaries and day refresh |
| `numbers.test.ts`, `exercise-text.test.ts`, `weight-format.test.ts` | Decimal/duration input, precision, progress wording, date context and axis labels |
| `stats.test.ts` | Weight summaries, daily bests, selected loads, grouped totals and active days |
| `charts.test.ts`, `sparkline.test.tsx` | Date spacing, padded domains, nonnegative floors, ticks and sparse SVG output |
| `update-banner.test.tsx` | The new-version banner reloads only on Reload and hides on Later (the service worker itself is mocked) |

## Limits and manual checks

There is no real-browser or end-to-end test suite. fake-indexeddb does not
prove behavior under browser storage limits, eviction or private browsing.
Mocked downloads and persistence responses do not prove that a browser saved
a file or granted persistence.

On a phone, check sheet focus/return, Escape or Back, the keyboard, scrolling
and safe-area spacing. Try comma decimal input, backdated entries and the
Minutes/Seconds fields. Export and restore a real file, including Cancel and
an invalid file. Check storage support and refusal states.

Scroll a long history: the header stays on top and focused rows are not
hidden under it. Swipe between Weight and Exercises in both directions, from
a chart and from an exercise row link: the tab switches and the row does not
open. Outward swipes, vertical scrolling, pinch zoom, the exercise picker in
the set sheet and the browser's edge Back gesture must keep working.

Check installation, offline reload after the first online visit and an
update between two production builds: the banner appears, Later hides it, and
Reload loads the new version with the data still there. These PWA and phone checks are
manual, not covered by jsdom.
