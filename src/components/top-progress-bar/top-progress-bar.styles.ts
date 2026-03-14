import clsx from "clsx";

const wrapper = clsx(
  "rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,33,0.94),rgba(8,13,25,0.94))] px-4 py-4",
  "shadow-[0_20px_48px_rgba(3,8,20,0.28)]",
);

const header = clsx("flex items-start justify-between gap-3");

const title = clsx("text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]");

const value = clsx("text-2xl font-semibold leading-none text-[var(--ink-strong)]");

const meta = clsx("mt-1 text-sm text-[var(--ink-soft)]");

const track = clsx(
  "mt-4 h-3 overflow-hidden rounded-full border border-white/10 bg-white/7",
);

const fill = clsx(
  "h-full rounded-full bg-[linear-gradient(90deg,#9dfc57,#b6ff4f_55%,#d9ff8a)] transition-[width] duration-500 ease-out",
  "shadow-[0_0_28px_rgba(182,255,79,0.45)]",
);

const footer = clsx("mt-3 flex items-center justify-between gap-3 text-xs text-[var(--ink-dim)]");

const footerStrong = clsx("font-semibold text-[var(--ink-soft)]");

export const topProgressBarClasses = {
  wrapper,
  header,
  title,
  value,
  meta,
  track,
  fill,
  footer,
  footerStrong,
};
