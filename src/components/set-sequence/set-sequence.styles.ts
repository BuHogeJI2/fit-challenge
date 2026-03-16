import clsx from "clsx";

const wrapper = clsx("mt-4");

const title = clsx(
  "text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]",
);

const empty = clsx(
  "mt-3 text-sm leading-6 text-[var(--text-muted)]",
);

const list = clsx("mt-3 flex flex-wrap gap-2");

const item = clsx(
  "inline-flex min-h-12 items-center gap-3 rounded-[1rem] border border-[var(--tone-neutral-border)] bg-[rgba(4,9,16,0.52)] px-3 py-2",
  "shadow-[0_8px_20px_rgba(0,0,0,0.16)]",
);

const step = clsx(
  "inline-flex min-h-7 min-w-7 items-center justify-center rounded-full border border-[var(--tone-info-border)] bg-[rgba(109,199,255,0.14)] px-2",
  "text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--tone-info-text)]",
);

const meta = clsx("flex min-w-0 flex-col");

const label = clsx("text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text-muted)]");

const value = clsx("text-sm font-semibold text-[var(--text-primary)]");

const removeButton = clsx("ml-1 rounded-full px-3 py-1");

export const setSequenceClasses = {
  wrapper,
  title,
  empty,
  list,
  item,
  step,
  meta,
  label,
  value,
  removeButton,
};
