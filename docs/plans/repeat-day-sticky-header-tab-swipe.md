# Plan: Per-day repeat, sticky header, tab swipe

## Task
Three small UX fixes for daily use on a phone:
1. When you backfill a past day, you can't add another copy of that day's set in one tap. The bottom "Repeat" always logs to today, and that's on purpose.
2. The Weight / Exercises / Settings header scrolls away, so you have to scroll up to switch tabs.
3. You can't switch between Weight and Exercises with a horizontal swipe.

## Non-goals
- The bottom "Repeat" keeps logging to today. That's the main gym flow, and a test covers it.
- No swipe animation that follows the finger. The user decided "not for now". It would need both screens mounted.
- No swipe on exercise detail or settings, and no swipe-to-go-back.
- No swipe for weight months. Month prev/next stay as buttons.
- No safe-area-top work: `index.html` has no `viewport-fit=cover`.

## Decisions & rationale
- **Per-day "+" chip (user chose option A).** Each history day gets a "+" chip after its set chips. A tap repeats that day's last set into that same day. Rejected: a guess based on whether the last set was entered today. It can surprise the user.
- **Source set = `day.sets.at(-1)`.** `groupSetsByDay` uses `sortSets` (date, then `createdAt`), so this is the last set entered for that day. It is not the day's best set and not the overall last set.
- **Copy numbers only, never the note.** This matches today's bottom repeat.
- **Toast:** "Logged 28 reps" for today. When the date isn't today: "Logged 28 reps · Oct 15" (`formatDateInContext`). Undo works the same way for both.
- **Sticky header:** `sticky top-0 z-10 bg-ground` on `appClasses.header`. FABs are `z-10 fixed`, the toast is `z-20`, and sheets are top-layer `<dialog>`s, so the order stays correct.
- **Swipe uses native touch events, not pointer events.** The gesture is touch-only and fires on release. Touch events don't need `touch-action`, and that CSS can't be undone for descendants such as the sheet's exercise picker. Codex and I agree.
- **Gesture rules** (from the Codex review):
  - Track one touch identifier.
  - Ignore a start within 24px of either viewport edge (`clientX`), because of iOS back.
  - Ignore a start inside an `input`/`textarea`/`select`.
  - Cancel the gesture for good on a clear vertical move (|dy| ≥ 10px and |dy| > |dx| at any `touchmove`), multitouch, `touchcancel`, a route change, or any `dialog[open]`. Check for an open dialog both at start and at end, because sheets are DOM children of `<main>` and can open mid-gesture.
  - Fire on `touchend` when |dx| ≥ 60px and |dx| > 1.5·|dy|.
  - Register `touchend` with `{ passive: false }`. Call `preventDefault()` only for a recognized swipe whose event is `cancelable`, so the row link, chip or chart point under the finger doesn't also activate. jsdom can only check `defaultPrevented`; real click suppression is a device check.
  - Swipe left on Weight goes to Exercises; swipe right on Exercises goes to Weight. Swipes outward from either tab do nothing.
- **Swipes may start on the chart.** The chart only handles taps and arrow keys, not drags, so excluding it would leave an arbitrary dead area.
- **The hook lives under an `AppShell`.** `App` renders `<Router>`, so `useLocation` can't run in `App`. Move the header and `<main>` into an `AppShell` child inside the Router and call the hook there.
- **Hook location:** `src/lib/gestures/use-tab-swipe.ts` (+ `use-tab-swipe.types.ts`, `index.ts`). AGENTS.md says shared hooks go in `src/lib`.
- **Navigation pushes history**, the same as the `ModeNav` links.
- **Scroll position stays as it is today** when switching tabs, by tap or swipe. Scroll-to-top would be a separate visible change, so it is out of scope unless the user asks for it.

## Assumptions
- The "+" chip reuses `chipBase` (focusable, `min-h-11`) with a quieter border. Its aria-label is `Repeat 28 reps on Thursday, Oct 15` (`formatSetValues` + `formatDayHeading`).
- The chip is hidden on archived exercises, the same as the bottom actions.

## Phases

### Phase 1: Per-day repeat chip
- **Goal:** one tap repeats a day's last set into that day.
- **Changes:**
  - `src/components/exercise-detail-screen/exercise-detail-screen.tsx`: generalize `handleRepeatLast` into `handleRepeat(set, date)`. The bottom button calls `handleRepeat(lastSet, todayKey)`. Each day row renders a "+" chip after `day.sets` that calls `handleRepeat(day.sets.at(-1), day.date)`. Add the contextual toast text.
  - `exercise-detail-screen.styles.ts`: add an `addChip` class.
  - `src/test/exercises.test.tsx`: new tests:
    - (a) An old day with two different sets with distinct `createdAt`, plus a newer day. "+" on the old day adds a copy of its last-entered set to that day, not to Today and not to the best set. Undo removes it.
    - (b) `reps_weight` copies reps and kg even when the chart shows another load.
    - (c) `time` copies seconds.
    - (d) A rejected write shows the error, with no success toast and no Undo.
    - (e) No "+" chip on an archived exercise.
    - The existing "repeats the last set today" test stays unchanged.
  - `docs/roadmap.md` (Exercises bullet) and `docs/testing.md` (coverage row).
- **Verification:** `pnpm test`, `pnpm typecheck`, `pnpm lint`
- **Done when:** the new tests pass, and on a phone "+" on yesterday adds a chip to yesterday.
- **Commit:** `feat: repeat a set into its own day`

### Phase 2: Sticky header
- **Goal:** the mode nav and Settings stay visible while scrolling.
- **Changes:** `src/components/app/app.styles.ts` (`header`: `sticky top-0 z-10 bg-ground`, plus a little bottom padding if the scrolled content looks cramped).
- **Verification:** `pnpm test`, `pnpm lint`. CSS can't be tested in jsdom. Manual: a long history scrolls under the header; keyboard focus on rows isn't hidden behind it; the update banner still shows below it; it works on a short viewport and in iOS standalone mode; the detail screen's sticky bottom actions are unaffected.
- **Done when:** the header stays in place on a long exercise history on a phone.
- **Commit:** `feat: keep the mode nav fixed at the top`

### Phase 3: Swipe between Weight and Exercises
- **Goal:** a horizontal swipe on `/weight` or `/exercises` switches tabs.
- **Changes:**
  - New `src/lib/gestures/` hook: native listeners on a ref, with the gesture rules above.
  - `src/components/app/app.tsx`: extract `AppShell` inside `<Router>`, attach the ref to `<main>`, and run the swipe only on the exact `/weight` and `/exercises` routes.
  - `docs/architecture.md` (routing) and `docs/testing.md` (coverage row + manual checks).
- **Verification:** `pnpm test`, `pnpm typecheck`, `pnpm lint`, with new tests in `src/test/app.test.tsx`, using `fireEvent.touchStart/Move/End` with `touches`/`changedTouches`, since jsdom has `TouchEvent` but no `Touch`:
  - left swipe on Weight goes to `#/exercises`; right swipe goes back;
  - outward swipes do nothing;
  - a short or mostly vertical swipe does nothing;
  - a vertical start with a horizontal tail does nothing;
  - multitouch does nothing;
  - a start near the edge does nothing;
  - nothing happens on `/exercises/:id` or `/settings`;
  - nothing happens while a sheet is open;
  - a recognized swipe calls `preventDefault` on `touchend`;
  - `touchcancel` or a route change before release, followed by a fresh valid swipe: only the fresh swipe navigates, and stale state never does.

  Manual checks on iOS Safari, standalone mode and Android: normal vertical scroll, pinch zoom, scrolling the exercise picker inside the sheet, edge back still works, no click after a swipe (especially a swipe that starts on an exercise row link), both directions.
- **Done when:** the tests pass and the phone checks pass.
- **Commit:** `feat: switch tabs with a horizontal swipe`

## Phase dependencies
| Phase | Depends on | Blocks | Parallel with | Nature of the dependency |
|-------|-----------|--------|---------------|--------------------------|
| 1 | none | none | 2, 3 | none |
| 2 | none | none | 1, 3 | Both 2 and 3 edit `app.tsx`/`app.styles.ts`, which means merge conflicts only, no logical dependency |
| 3 | none | none | 1, 2 | none |

Baseline (2026-10-21, develop @ a03fb33): `pnpm test` 334/334 pass, `pnpm typecheck` and `pnpm lint` clean.
