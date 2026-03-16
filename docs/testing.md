# Testing

## Tooling

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `jsdom`

Vitest is configured in `vite.config.ts`, with shared setup in
`src/test/setup.ts`.

## Commands

```bash
pnpm test
pnpm lint
pnpm build
```

## Current Test Coverage

### `src/test/challenge-app.test.tsx`

Covers the top-level app behavior with mocked challenge data:

- empty state when no featured run is available
- opening day details from the next-days list
- next-days cards showing date context plus exercise targets
- opening day details from the calendar
- upcoming-day overlays staying read-only even if invalid future local progress exists
- current-day overlays staying informational only
- past-day overlays exposing `Track sets` plus `Mark done` / `Undo completion`
- opening the focused tracker from featured exercises
- opening the focused tracker from a past-day overlay footer
- adding and removing sets in the focused tracker
- local progress persistence keyed by run slug
- undoing a locally completed day

### `src/test/use-featured-challenge.test.tsx`

Covers error handling in the loading hook:

- rejected fetches surface an error string and clear challenge data

## Current Gaps

The repo-level quality gates are stricter than the current test suite. Missing
coverage includes:

- loading state rendering
- successful load assertions for the full hero/day flow
- explicit scheduled, active, and completed run-phase behavior
- focused utility coverage for next-days formatting and date labels
- pure utility coverage for `pickFeaturedRun()` and
  `buildChallengeViewModel()`

## Recommended Next Test Targets

1. Add logic-first tests for `challenge.utils.ts` to lock down date-driven
   state derivation.
2. Expand `ChallengeApp` tests to cover loading and completed-run rendering.
3. Add targeted tests for `UpcomingDays` or utility-level day-preview formatting
   if the preview cards keep evolving.

## Notes

- Tests currently rely on mocked challenge data rather than live Supabase.
- There is no end-to-end test runner in the repo today.
