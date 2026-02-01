# Style Guide

This document defines the required file structure, naming conventions, architecture, and styling patterns for the project. Follow these rules for all new or updated code.

## File Structure

### Component Structure
All components must live under `src/components/${component-folder}` and use the following file pattern:

- `index.ts` (barrel exports)
- `component-name.tsx` (logic + view)
- `component-name.types.ts` (type definitions)
- `component-name.styles.ts` (styling)
- `component-name.utils.ts` (local helpers, if needed)

### Shared Architecture
Global hooks, utilities, and contexts must be placed in:

- `src/lib/...`

## Naming Conventions

### TypeScript Definitions
Use strict prefixes:

- **Types**: `T` prefix (e.g., `type TComponentType = ...`)
- **Interfaces**: `I` prefix (e.g., `interface IComponentProps { ... }`)
- **Enums**: `E` prefix (e.g., `enum EVariants { ... }`)

## Styling Guidelines

### Tailwind CSS + CLSX
Styles must live in `*.styles.ts` files, not inline in components.

#### Rules
- Use `clsx` to merge and organize class strings.
- Split long class strings into logical arguments (layout/base, responsive, states).
- Export a single object containing class definitions for component elements.

#### Example (`component-name.styles.ts`)
```ts
import { clsx } from "clsx";

const wrapper = clsx(
  "w-full bg-white", // Layout/Base
  "md:rounded-lg md:shadow-sm", // Responsive/Desktop
);

const text = clsx(
  "text-sm text-gray-500",
  "hover:text-gray-900 transition-colors",
);

export const componentClasses = {
  wrapper,
  text,
};
```

## Architectural Patterns

- Keep components focused and small; move shared logic to `src/lib`.
- Use barrel files (`index.ts`) for public exports at the component folder level.
- Keep view and logic in the component `*.tsx` file; keep styling in `*.styles.ts`.
