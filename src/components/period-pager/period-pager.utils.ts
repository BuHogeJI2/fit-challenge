import type { TDragSample, TPeriodDirection } from "./period-pager.types";

export const AXIS_LOCK_PX = 8;
export const EDGE_GUARD_PX = 24;
export const COMMIT_SHARE = 0.25;
export const FLICK_VELOCITY = 0.5;
export const FLICK_MIN_PX = 16;
export const EDGE_RESISTANCE = 0.35;
export const CLICK_GUARD_MS = 400;
const VELOCITY_WINDOW_MS = 100;

const IGNORED_TARGETS = "input, textarea, select, button, a, [contenteditable], [data-pager-ignore]";

export const isIgnoredTarget = (target: EventTarget | null) =>
  !(target instanceof Element) || target.closest(IGNORED_TARGETS) !== null;

export const isDialogOpen = () => document.querySelector("dialog[open]") !== null;

export const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Slows the drag toward a side that has no period. */
export const resistOffset = (dx: number, canPrevious: boolean, canNext: boolean) =>
  (dx > 0 && !canPrevious) || (dx < 0 && !canNext) ? dx * EDGE_RESISTANCE : dx;

/**
 * Keeps the track within one page of rest. Only the neighbours are
 * rendered, so a larger offset would show an empty strip.
 */
export const clampOffset = (offset: number, width: number) => Math.max(-width, Math.min(width, offset));

/** Velocity in px/ms over the most recent samples; positive means rightward. */
export const getVelocity = (samples: readonly TDragSample[]) => {
  const last = samples[samples.length - 1];
  if (!last) return 0;
  const first = samples.find((sample) => last.time - sample.time <= VELOCITY_WINDOW_MS) ?? last;
  const elapsed = last.time - first.time;
  return elapsed > 0 ? (last.x - first.x) / elapsed : 0;
};

/**
 * Returns the period a released drag moves to, or null when it should snap
 * back: past a quarter of the width, or a flick whose speed points the same
 * way as the drag.
 */
export const getReleaseDirection = (
  dx: number,
  velocity: number,
  width: number,
  canPrevious: boolean,
  canNext: boolean,
): TPeriodDirection | null => {
  if (dx === 0) return null;
  const direction: TPeriodDirection = dx < 0 ? "next" : "previous";
  if (direction === "next" ? !canNext : !canPrevious) return null;
  const isFar = Math.abs(dx) > width * COMMIT_SHARE;
  const isFlick =
    Math.abs(velocity) >= FLICK_VELOCITY && Math.abs(dx) > FLICK_MIN_PX && Math.sign(velocity) === Math.sign(dx);
  return isFar || isFlick ? direction : null;
};

/** Reads the horizontal translation from a CSS transform value. */
export const parseTranslateX = (transform: string) => {
  const matrix = /^matrix\(([^)]+)\)$/.exec(transform);
  if (matrix) return Number(matrix[1].split(",")[4]) || 0;
  const matrix3d = /^matrix3d\(([^)]+)\)$/.exec(transform);
  if (matrix3d) return Number(matrix3d[1].split(",")[12]) || 0;
  const translate = /translate(?:3d|X)?\(\s*(-?[\d.]+)px/.exec(transform);
  return translate ? Number(translate[1]) : 0;
};

export const nextFrame = (callback: () => void) => {
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => callback());
  } else {
    window.setTimeout(callback, 16);
  }
};
