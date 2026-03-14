import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-[var(--border-subtle)] bg-[rgba(13,23,34,0.88)] px-5 py-5",
  "shadow-[0_22px_54px_rgba(3,8,20,0.34)]",
);

const header = clsx("flex flex-wrap items-center justify-between gap-3");

const title = clsx("text-xl font-semibold text-[var(--text-primary)]");

const phase = clsx("text-sm text-[var(--text-muted)]");

const grid = clsx("mt-4 grid gap-3 sm:grid-cols-3");

const card = clsx(
  "rounded-[1.4rem] border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-4 py-4",
  "backdrop-blur-sm",
);

const label = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const value = clsx("mt-2 text-2xl font-semibold text-[var(--text-primary)]");

const meta = clsx("mt-1 text-sm text-[var(--text-muted)]");

export const progressSummaryClasses = {
  wrapper,
  header,
  title,
  phase,
  grid,
  card,
  label,
  value,
  meta,
};
