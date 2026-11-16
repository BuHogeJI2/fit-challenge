---
priority: low
created: 2026-11-16
where: [pnpm-lock.yaml, package.json]
---

# Refresh Browserslist data

## Description

The production build succeeds, but `./node_modules/.bin/vite build` reports:
“Browserslist: browsers data (caniuse-lite) is 10 months old.” The dependency
refresh is separate from the weight, training, and navigation changes.

## Reasoning

Low priority: no build or test is blocked and no user-visible failure was
observed. Refreshing the database keeps browser targeting data current.

## Possible fix

Update the Browserslist database with the repository's package manager, inspect
the lockfile changes, then run the production build, typecheck, lint, and tests.
