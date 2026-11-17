import type { UseEmblaCarouselType } from "embla-carousel-react";

const IGNORED_TARGETS = "input, textarea, select, [contenteditable], summary, [data-pager-ignore]";

export const canDragPeriod = (_api: UseEmblaCarouselType[1], event: TouchEvent | MouseEvent) =>
  event.type === "touchstart" &&
  event.target instanceof Element &&
  !event.target.closest(IGNORED_TARGETS) &&
  !document.querySelector("dialog[open]");

export const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
