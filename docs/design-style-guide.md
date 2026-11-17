# Design style guide

Fit uses the Journal composition: a narrow reading column, charts above dated
records, sentence-style input and a warm monochrome palette. Styles live in
component-local `*.styles.ts` files using Tailwind v4 and `clsx`; file and type
conventions are in [STYLE_GUIDE.md](../STYLE_GUIDE.md).

## Tokens and type

The source of truth is [src/index.css](../src/index.css) `@theme`:

| Token | Value | Current role |
| --- | --- | --- |
| `ground` | `#f3f2ee` | Page and sheet background |
| `ground-sunken` | `#ebe9e3` | Panels, soft buttons, segmented tracks and hover surfaces |
| `ground-raised` | `#fbfaf7` | The selected option of a segmented control |
| `ink` | `#222222` | Main text, actions and chart marks |
| `ink-soft` | `#44433f` | Supporting text and notes |
| `muted` | `#66655f` | Labels, dates and secondary text |
| `rule` | `#dad8d1` | Faint row separators in dense lists and chart grid |
| `rule-strong` | `#c8c6be` | Input lines and chip borders |

Geist Variable is the body font; Geist Mono Variable is used for chart axes
and journal changes. Both are bundled through Fontsource. Body numbers use
tabular spacing. There is no serif font.

| Use | Size |
| --- | --- |
| Period titles (month, week or window span) | 1.75rem, normal weight, tight tracking; long spans wrap instead of truncating |
| Detail titles (exercise, training) | 2.75rem, normal weight, tight tracking |
| Main sentence inputs / surrounding sentence | 2.5rem / 1.75rem |
| Exercise names / section headings | 1.5rem / 1.125rem |
| Body and controls | 1rem; supporting prose and set chips also use 0.9375rem |
| Labels and readouts / small metadata | 0.875rem / 0.75rem |
| SVG axis / goal labels | 10px / 11px in SVG coordinates |

## Layout

The app is full width up to `max-w-md` (28rem), centered on wider screens.
Header and main content use 1.5rem horizontal padding. Main content reserves
7rem below it for floating controls. Space separates sections. A faint `rule`
line appears only between rows of dense lists (weigh-ins, weeks, exercise
and training history); training days and the library use spacing alone.
There are no strong ink rules, and ordinary rows have no card background.

Sheets sit at the bottom, are at most 92vh tall, and use a rounded top edge
and an ink backdrop. At the `sm` breakpoint they share the app's maximum
width. Sheet, toast and fixed action spacing account for the bottom safe area.

## Component roles

- **Button:** `filled` uses ground text on ink for primary actions; `outline` is a
  bordered secondary action; `soft` is a sunken filled pill for secondary
  actions such as Edit, Show all, This week and New exercise; `quiet` is muted
  text. No action is underlined. Filled, outline and soft controls have `md`
  and `sm` sizes with minimum heights of 3.25rem and 2.75rem. Quiet controls
  are at least 2.75rem high.
- **Top tabs:** Weight and Exercises mark the active section by weight and
  contrast only.
- **Segmented control:** switches a screen's subviews (Month/Weeks/All,
  Week/Library). A sunken rounded track holds 2.75rem options; the selected
  one sits on a raised pill with semibold ink text and exposes `aria-pressed`.
- **Back links:** muted text with a chevron, keeping a full accessible name
  such as "Back to weeks". Disabled
  controls fade; keyboard focus uses a visible outline.
- **Sheet:** the shared native modal `dialog` owns its title, Close button
  and backdrop dismissal. Forms keep validation and failed-write messages
  inside it. The browser supplies modal focus behavior. There is no drag handle
  because sheets do not support drag dismissal.
- **Field:** a visible label, an underline input and one hint or error.
  Errors set `aria-invalid`; the message is linked with `aria-describedby`.
  Sentence inputs use large underlined values with accessible labels.
- **Toast:** one dark, bottom-fixed status message with an optional action
  such as Undo. The default duration is six seconds. Failed actions are
  caught; data replacement dismisses action toasts.
- **Update banner:** a quiet sunken panel under the header that stays until
  the person taps Reload or Later. It never reloads on its own.
- **FAB:** the circular plus button is 3.75rem across, aligned to the right
  edge of the content column. It opens weight or set entry and has an
  accessible action name.
- **Journal rows:** a weight row is an edit button with date, note, value
  and change. Month and All initially show three rows with an explicit
  disclosure for the complete journal. Overall stats sit above range controls;
  first/latest/change below the chart belong to the selected period.
  A week row in the Weeks view is a detail link with a chevron, the date
  range, the first and last weigh-in of the week ("80.8 → 80.4 kg"), the
  change between them with its direction, the number of weigh-ins ("so far"
  for the current week) and the measured weekdays when they are not Monday and
  Sunday. A week with one weigh-in shows its value and no change. A library
  row is a detail link with the exercise name, a chevron and one line about
  its latest training: "Last Oct 13 · 3 sets · 60 reps", "N sets at 60 kg" for
  one load, "N sets · mixed weights" for several, or the sessions in the last
  4 weeks. Library rows have no chart.
- **Chips:** progress-view, load and exercise-picker chips select a value
  and expose `aria-pressed`; quick-rep chips fill the input. History chips
  open set editing. A stronger outline marks daily bests, at the selected load for
  weighted exercises. Stats and summaries remain plain text.

## Charts

Each complete period, including its chart, summary and history list, is swipeable.
The arrows are the visible controls; there is no swipe hint. Adjacent periods slide
with the finger and settle before the selected period changes. Missing periods
have the carousel's natural edge resistance. Main section tabs stay fixed.
All and Library have no period swipe. Overflowing exercise choices fade only
at edges where more choices remain to scroll into view.

## Motion

Motion uses the shared `--motion-*` values in `src/index.css`: 140ms for fades
and press feedback, 180ms for indicators and toasts, and 240ms for sheet
entrance. Embla owns the period carousel's momentum and settling. A saved row
receives 700ms of subtle background emphasis. The pager follows the finger
directly and settles with the same direction when its arrows are used.
These shared motion rules are unlayered and override Tailwind transition
utilities on the elements that opt into them.

The segmented control's pill slides to the selected option; top tabs change
only in weight and color. Screens fade once loaded;
newly disclosed rows fade without animating list height. Sheets enter upward
with a fading backdrop where `@starting-style` is supported and close
immediately. No route slides, chart redraw animation, number counting, automatic
nudges or staggered lists are used.

Respect `prefers-reduced-motion`: skip automatic slides, fades and emphasis,
including indicator movement. A dragged pager still follows the finger and
commits immediately on release. Keyboard focus and form submission never wait
for animation.

## Chart presentation

Follow the [chart rules](roadmap.md#chart-rules): real calendar spacing, raw
points, labelled axes and units, no zero-filled missing days, and readable
empty, single-point and flat states. Exercise day totals use muted bars from
a zero baseline with the selected bar in ink; rest days are empty slots. Month and Weeks weight charts keep the
domain on their own data; All includes the goal in its domain. The Weeks
chart draws the daily weigh-ins as small muted dots behind the weekly line.

Full charts use a 342×224 viewBox. A point tap or Left/Right arrow selection
updates a visible live text readout; the list also exposes the records.
The training week chart uses a 342×112 viewBox with one column per day,
Monday to Sunday. A bar's height is its number of trainings (two fill the
chart), the count is printed above it, a past empty day gets a short tick and
a later day stays blank. Trainings without entries are not counted. It has no
axes, grid or interaction; its accessible name lists every day's count.
