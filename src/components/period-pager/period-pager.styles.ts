import clsx from "clsx";

const viewport = clsx("relative overflow-x-clip", "touch-pan-y touch-pinch-zoom");

const track = clsx("relative will-change-transform");

const current = clsx("relative");

const previous = clsx("absolute inset-y-0 right-full w-full overflow-hidden");

const next = clsx("absolute inset-y-0 left-full w-full overflow-hidden");

export const periodPagerClasses = {
  viewport,
  track,
  current,
  previous,
  next,
};

export const periodPagerMotion = {
  settle: "transform var(--pager-settle-duration, 240ms) var(--pager-easing, cubic-bezier(0.2, 0, 0, 1))",
  snap: "transform var(--pager-snap-duration, 200ms) var(--pager-easing, cubic-bezier(0.2, 0, 0, 1))",
};
