# Plan: Weight overview, training journal, and navigation

## Task

Shorten the weight overview, make individual weeks accessible, and replace the
exercise index as the default screen with a weekly training journal. Preserve
existing data and the current monochrome style.

## Decisions

- Every exercise entry belongs to a dated **Training**. Multiple trainings can
  happen on one day.
- Existing entries become one training per recorded date. Their original fields
  remain unchanged.
- Boxing/swimming sessions remain entries inside trainings, alongside sets.
  Training names do not count as sessions.
- Swipes navigate periods inside sections. Weight and Exercises switch through
  the top tabs.
- Month shows three recent weigh-ins, with the complete list available on demand.
- Exercise views become **Week | Library**.
- No reusable routines, training templates, timers, or new exercise metrics in
  this change.

## Animation approach

| Interaction | Motion |
|---|---|
| Swipe between periods | Content follows the finger, then settles into place |
| Previous/next arrows | Same directional slide as a swipe |
| Tab selection | Moving active indicator |
| Opening a screen | Short fade once its data is available |
| Expanding entries or training contents | Newly revealed rows fade in |
| Opening an entry sheet | Slide upward with backdrop fade |
| Successful save or Undo | Brief emphasis on the affected row |
| Buttons, chips, and toasts | Small press feedback and short entrance |

Keep these around 150–250 ms, with slightly longer row emphasis. Avoid chart
redraw animations, counting numbers, automatic nudges, and staggered entrances
across whole lists.

Under reduced motion, direct finger tracking remains responsive, but automatic
sliding, settling, fades, and smooth scrolling are skipped. Sheet closing can
remain immediate where a clean exit animation would require delaying focus or
dismissal.

## Phase 1 — Add trainings without losing records

**Goal:** Establish the data model, migration, backup support, and minimum working
logging flow together.

**Changes**

- Add `TTraining` with an ID, date, optional name/note, and timestamps.
- Add required `trainingId` to `TSet`.
- Update `src/lib/db/db.ts` to Dexie version 3, adding the trainings table and
  lookup indexes.
- Introduce shared legacy conversion used by the database upgrade and old-backup
  parsing.
- Update repositories, backup types/parser/export/restore/wipe, and Settings import
  counts.
- Add training selection to the existing entry sheet and adapt every
  repeat/logging action.

**Logging rules**

- No training on that date: saving creates training and entry together.
- One training: show its name and a **New training** action.
- Several: require a choice, with nothing guessed.
- Adding inside a known training fixes the target.
- Moving a training changes its date and all child dates atomically.

**Data-preservation requirements**

- Keep every existing entry, including sessions and records for archived or
  missing exercises.
- Preserve IDs, values, dates, notes, timestamps, and unexpected stored fields.
  Add only the training link.
- Do not deduplicate, recreate, or clean up legacy records.
- The version-3 upgrade leaves other tables untouched. A version-1 upgrade still
  applies the existing version-2 `progressView` default.
- Abort failed upgrades without resetting the database.

Undo must restore compound deletions completely. A stale entry Undo must not
recreate a training deleted by a later action. Restoring archived exercise history
keeps the existing behavior.

Add explicit blocked-update and reload states. Dexie normally closes an older
connection when another window upgrades it; the UI should explain this accurately.
[Dexie documentation](https://dexie.org/docs/Dexie/Dexie.on.versionchange)

**Verification**

Add real version-1/version-2 database fixtures and verify:

- Original records and unaffected tables match before and after migration.
- Failure after partial writes rolls back, and retry succeeds.
- Old backup schemas 1–3 convert correctly.
- New schema-4 backups round-trip without losing fields.
- Failed restore, wipe, move, delete, and Undo leave consistent data.

**Done when:** Existing logging still works, every entry has a training, and
preservation tests pass.

**Suggested commit:** `feat: group exercise entries into trainings`

## Phase 2 — Build the weekly training journal

**Goal:** Make the exercise section answer “what did I do this week?”

**Changes**

- Refactor `exercises-screen` into Week and Library views.
- Add weekly aggregation in `src/lib/stats`.
- Show training groups under their dates, with session counts and per-exercise
  summaries.
- Add training detail with editable entries, name/note, date movement, and
  deletion.
- Make Library searchable, with alphabetical/recent sorting and collapsed archived
  exercises.
- Preserve existing exercise progress charts.
- Make old grouped records easy to split through **Move to training**.

A training without a name derives its display title from its session entries,
falling back to “Training.” Totals keep sessions, reps, loads, and durations
distinct.

**Verification:** Extend exercise UI and repository tests for multiple trainings
per day, historical weeks, search, movement, archived history, and returning from
details.

**Done when:** The weekly example of two boxing trainings and one swim is clear,
with each set attached to the correct training.

**Suggested commit:** `feat: show a weekly training journal`

## Phase 3 — Compact the weight overview

**Goal:** Make the chart and period comparison the main information.

**Changes**

Update `weight-screen`, `weight-journal`, and weight statistics:

- Put the compact **Overall** block above range controls.
- Show first/latest recorded weights, their dates, and period change.
- Keep average, range, and count as supporting information.
- Show three recent entries, with **Show all N weigh-ins / Show fewer**.
- Keep any selected chart entry editable through its readout.
- Apply disclosure to All as well.

Handle empty periods, one entry, and missing measurements at the start of a month
without inventing values.

**Verification:** Extend weight UI and statistics tests, including a full daily
month and selecting a hidden entry.

**Done when:** A month with 31 entries opens as a compact overview while every
entry remains accessible.

**Suggested commit:** `feat: simplify the weight overview`

## Phase 4 — Add week detail and preserve navigation context

**Goal:** Open a concrete weight week and return without losing position.

**Changes**

- Make `weight-weeks` rows navigable.
- Add a daily week chart, summary, all weigh-ins, and previous/next controls.
- Add visible **Back to weeks** navigation.
- Keep selected views and periods in validated hash-route parameters.
- Restore scroll position and useful focus when returning from weight, training,
  or exercise details.

**Verification:** Test cross-month/year weeks, sparse weeks, direct links, invalid
parameters, and Back navigation.

**Done when:** Opening a week and returning restores the same overview window and
position.

**Suggested commit:** `feat: open individual weight weeks`

## Phase 5 — Implement shared sliding navigation

**Goal:** Give period navigation one consistent gesture and animation.

**Changes**

- Introduce a shared `PeriodPager`.
- Use it for weight months, 12-week windows, individual weight weeks, and training
  weeks.
- Remove content-wide section switching from `app.tsx`.
- Swipe within the period header plus chart or weekly summary.
- Keep visible arrows and add a dismissible swipe hint.
- Give overflowing exercise choices a partial next item and edge fade.

Preserve vertical scrolling, pinch zoom, browser edge gestures, chart taps, and
chart keyboard controls. Prevent a completed drag from also activating a chart
point. Adjacent panels must not receive focus or duplicate announcements.

Commit the new period on release; animation must not delay navigation or data
writes.

**Verification:** Gesture tests cover cancellation, boundaries, rapid input, open
sheets, data replacement, and click suppression. Phone checks verify physical
feel and scrolling.

**Done when:** Arrows and swipes produce matching slides without switching
sections accidentally.

**Suggested commit:** `feat: slide between chart and training periods`

## Phase 6 — Add supporting motion and finish verification

**Goal:** Add the remaining animations consistently without complicating forms or
navigation.

**Changes**

- Add shared motion values in `src/index.css`.
- Apply the tab, screen, sheet, disclosure, saved-row, and control feedback
  described above.
- Remove the decorative sheet handle, since sheets will not support drag
  dismissal.
- Update existing architecture, design, roadmap, and testing documentation.

**Verification:** Run the full suite, typecheck, lint, and production build.
Manually check reduced motion, keyboard focus, phone scrolling, offline reload,
multi-window updates, and a real backup export/restore.

**Done when:** Motion supports the interaction, forms remain responsive, and all
release checks pass.

**Suggested commit:** `feat: add consistent interface motion`

## Dependencies

| Phase | Requires | Reason |
|---|---|---|
| 1 | — | Storage and logging foundation |
| 2 | 1 | Training records and repository operations |
| 3 | — | Independent weight presentation change |
| 4 | 3 | Weight screen structure and period summaries |
| 5 | 2, 4 | All period views exist |
| 6 | 5 | Shared paging motion is established |

## Verification limits

At planning time, the existing **386 tests, typecheck, and lint pass**. The new
migration and animations have not been implemented or tested. Browser and phone
behavior remains a manual release gate.

A rollback release must retain database version 3; reverting application behavior
must not lower the stored schema version.
