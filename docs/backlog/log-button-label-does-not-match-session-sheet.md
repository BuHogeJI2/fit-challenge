---
priority: low
created: 2026-11-04
where: [src/components/exercises-screen/exercises-screen.tsx, src/components/set-entry-sheet/set-entry-sheet.tsx]
---

# Log button label does not match the session sheet

## Description

The floating "+" button on the Training list is always labelled "Log set"
(`src/components/exercises-screen/exercises-screen.tsx:143`). The sheet it opens
takes its title from the exercise it preselects, which is the most recently used
one (`src/components/set-entry-sheet/set-entry-sheet.tsx:311`). When that exercise
uses the Sessions metric, the button says "Log set" and the dialog opens as
"Log session". The title also changes when another exercise chip is picked.

## Reasoning

Low: this is a naming mismatch for screen readers and readers of the button.
No data is wrong and the flow works.

## Possible fix

- Give the button a neutral label such as "Log", or let it follow the noun of
  the exercise the sheet will preselect.
- Decide whether the sheet title should stay fixed while the exercise picker
  is open, so it does not change when a chip is tapped.
