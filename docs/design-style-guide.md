# Design Style Guide

## Summary

Challenge Forge uses a small semantic component system on top of the token
palette in `src/index.css`. The goal is that users can recognize what an
element **is** before they read its text:

- passive info should look passive
- editable controls should look editable
- actions should look clickable
- logged history should read like history, not like another stat card

The shared `src/components/ui/` layer follows shadcn-style component patterns
for reusable variants, but keeps the app's own dark visual identity.

This guide defines the component roles and how they should feel in the UI.

## Component Roles

### Surface

Use for page sections, large cards, sheets, and exercise containers.

- strongest container treatment
- elevated background and stronger border
- supports grouped content with multiple child areas
- never used for inline actions or compact stats

### Stat Block

Use for passive, glanceable metrics such as `Logged`, `Remaining`, and `Sets`.

- smaller radius than surfaces
- muted fill and muted labels
- strong numeric value
- no hover state
- should never look clickable

### Input Field

Use for editable text or number entry.

- stronger contrast than passive blocks
- darker inner field with clearer border
- visible focus ring
- placeholder text must remain secondary

### Action Button

Use for all clickable actions. Buttons must be visually different from stat
blocks and badges.

- `primary`: highest-emphasis action, filled
- `secondary`: quiet outlined/soft action
- `info`: utility action tied to form or progress workflows
- `destructive`: remove/delete actions only
- `ghost`: low-emphasis utility

Disabled buttons must keep `cursor-not-allowed`.

### Log Row

Use for recorded items such as completed sets.

- flatter and more list-like than cards
- compact padding
- row action aligned to the edge
- reads like history, not like a form or metric panel

### Badge / Pill

Use for compact tokens such as targets or stateful metrics.

- concise only
- one line when possible
- should not replace buttons
- should not be used for long descriptive text

### Section Label

Use for non-interactive headings and meta labels.

- uppercase or small heading styles
- muted or decorative tone
- no button-like background

## Visual Rules

- Do not style passive info and interactive controls with the same container
  treatment.
- Do not use pills for destructive actions.
- Forms should always be grouped in a dedicated form block, not dropped inline
  between passive cards.
- Logged history should be visually separated from current input.
- Button colors indicate action type, not content type.

## Overlay Mapping

The day-details sheet should use these roles:

- exercise section: `Surface`
- logged/remaining/sets strip: `Stat Block`
- reps entry area: `Form` block with `Input Field` + `info` action button
- target indicator: `Badge`
- logged sets: `Log Row`
- remove set: `destructive` button

## Future Use

This guide is overlay-first in implementation, but the same roles should be
used across the rest of the app:

- featured-day card rows should distinguish passive progress from actions
- upcoming-day cards should remain surfaces, not pseudo-buttons everywhere
- calendar cells should stay interactive but not look like buttons from other
  contexts
- future admin screens should reuse the same button/input/panel roles instead
  of creating new local patterns
