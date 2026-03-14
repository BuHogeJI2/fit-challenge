# Theme System

## Summary

Challenge Forge uses a semantic dark theme. Colors are assigned by meaning, not
by component ownership. Interactive actions, status messaging, and passive
content accents must not reuse the same tone without a clear semantic reason.

The current implementation keeps the hero and page background slightly
expressive, but the main UI system follows strict semantic roles.

## Token Groups

### Foundation

- `--bg-app`
- `--bg-panel`
- `--bg-elevated`
- `--bg-soft`
- `--bg-overlay`
- `--border-subtle`
- `--border-strong`

### Text

- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--text-inverse`

### Semantic Tones

- `display`: decorative accents, hero chips, content badges
- `info`: current/today state, progress numerics, logging actions
- `success`: completion and ready-to-complete states
- `warning`: edits, cautionary notices, non-destructive alerts
- `danger`: destructive actions and error states
- `neutral`: panels, secondary actions, passive labels, disabled surfaces

## Component Mapping

- `ChallengeHero`
  - expressive background using `display` + subtle `success`
  - neutral pills and stat cards
- `TopProgressBar`
  - neutral shell
  - success fill
- `FeaturedDayCard`
  - exercise names: `display` section headings
  - exercise target pills: `info`
  - `Mark done`: `success`
  - `Open day details`: `neutral`
- `DayDetailsSheet`
  - exercise names: `display` section headings
  - `Add set`: `info`
  - logged totals and target pills: `info`
  - change note: `warning`
  - remove set: `danger`
- `ChallengeCalendar`
  - `today`: `info`
  - `done_local`: `success`
  - `missed`: `danger` soft fail
  - `upcoming`: subdued neutral
- `ChallengeStatus`
  - loading: `info`
  - error: `danger`
  - empty: `neutral`

## Rules

- Do not use `success` for passive content chips.
- Do not use `danger` for decorative surfaces.
- Use `display` for branded or decorative highlights, not for stateful actions.
- Use `info` for informative progress surfaces and non-destructive utility
  actions.
- Reserve success gradients for achievement moments only.
- Prefer semantic tokens from `src/index.css` over raw RGBA values in
  component styles.

## Future Themes

Future theme variants should override the same semantic token names instead of
introducing per-component color branches. That keeps theme switching cheap and
prevents semantic drift between themes.
