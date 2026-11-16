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
| `ground-sunken` | `#ebe9e3` | Panels and hover surfaces |
| `ink` | `#222222` | Main text, actions and chart marks |
| `ink-soft` | `#44433f` | Supporting text and notes |
| `muted` | `#66655f` | Labels, dates and secondary text |
| `rule` | `#dad8d1` | Row dividers and chart grid |
| `rule-strong` | `#c8c6be` | Input lines and chip borders |

Geist Variable is the body font; Geist Mono Variable is used for chart axes
and journal changes. Both are bundled through Fontsource. Body numbers use
tabular spacing. There is no serif font.

| Use | Size |
| --- | --- |
| Screen titles | 2.75rem, normal weight, tight tracking |
| Main sentence inputs / surrounding sentence | 2.5rem / 1.75rem |
| Exercise names / section headings | 1.5rem / 1.125rem |
| Body and controls | 1rem; supporting prose and set chips also use 0.9375rem |
| Labels and readouts / small metadata | 0.875rem / 0.75rem |
| SVG axis / goal labels | 10px / 11px in SVG coordinates |

## Layout

The app is full width up to `max-w-md` (28rem), centered on wider screens.
Header and main content use 1.5rem horizontal padding. Main content reserves
7rem below it for floating controls. Rules separate lists and sections;
ordinary rows have no card background.

Sheets sit at the bottom, are at most 92vh tall, and use a rounded top edge
and an ink backdrop. At the `sm` breakpoint they share the app's maximum
width. Sheet, toast and fixed action spacing account for the bottom safe area.

## Component roles

- **Button:** `filled` uses ground text on ink for primary actions; `outline` is a
  bordered secondary action; `text` is underlined; `quiet` is muted. Filled
  and outline controls have `md` and `sm` sizes with minimum heights of
  3.25rem and 2.75rem. Text/quiet controls are at least 2.75rem high. Disabled
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
  range, the number of weigh-ins, the average and the change. An exercise row is a detail link with its name, latest date,
  sparkline and progress sentence.
- **Chips:** progress-view, load and exercise-picker chips select a value
  and expose `aria-pressed`; quick-rep chips fill the input. History chips
  open set editing. A stronger outline marks daily bests, at the selected load for
  weighted exercises. Stats and summaries remain plain text.

## Charts

Period headers and their chart (or training summary) form a swipeable region.
Arrows and a dismissible swipe hint expose the gesture. Adjacent periods slide
with the finger; the list below changes when navigation commits. Main section
tabs stay fixed. All and Library have no period swipe. Overflowing exercise
choices fade only at edges where more choices remain to scroll into view.

## Motion

Motion uses the shared `--motion-*` values in `src/index.css`: 140ms for fades
and press feedback, 180ms for indicators and toasts, and 240ms for period
settling and sheet entrance. A saved row receives 700ms of subtle background
emphasis. The pager follows the finger directly and settles with the same
direction when its arrows are used.
These shared motion rules are unlayered and override Tailwind transition
utilities on the elements that opt into them.

Main tabs and view controls use a moving underline. Screens fade once loaded;
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
Sparklines use 342×32, share the date scale, have no axes or interaction and
are hidden from assistive technology.
