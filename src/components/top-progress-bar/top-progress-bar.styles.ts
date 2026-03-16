import clsx from "clsx";

const wrapper = clsx(
  "rounded-[1.8rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(19,33,49,0.96),rgba(7,16,24,0.96))] px-4 py-4",
  "shadow-[0_20px_48px_rgba(3,8,20,0.28)] ring-1 ring-[rgba(255,255,255,0.03)]",
);

const header = clsx("flex items-start justify-between gap-3");

const title = clsx("text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const value = clsx("text-2xl font-semibold leading-none text-[var(--text-primary)]");

const meta = clsx("mt-1 text-sm text-[var(--text-secondary)]");

const track = clsx(
  "mt-4 h-3 overflow-hidden rounded-full border border-[var(--tone-neutral-border)] bg-[rgba(255,255,255,0.045)]",
);

const fill = clsx(
  "h-full rounded-full bg-[linear-gradient(90deg,var(--tone-success-fill),var(--tone-success-strong)_55%,#d9ff8a)] transition-[width] duration-500 ease-out",
  "shadow-[0_0_28px_rgba(155,247,95,0.35)]",
);

const footer = clsx("mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]");

const footerStrong = clsx("font-semibold text-[var(--text-secondary)]");

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
