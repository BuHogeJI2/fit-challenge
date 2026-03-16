import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(19,33,49,0.96),rgba(8,14,22,0.98))] px-5 py-5",
  "shadow-[0_22px_54px_rgba(3,8,20,0.34)] ring-1 ring-[rgba(255,255,255,0.03)]",
);

const headingRow = clsx("flex items-center justify-between gap-3");

const title = clsx("text-xl font-semibold text-[var(--text-primary)]");

const description = clsx("text-sm text-[var(--text-muted)]");

const list = clsx("mt-4 space-y-3");

const card = clsx(
  "w-full cursor-pointer rounded-[1.35rem] border border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(19,33,49,0.96),rgba(8,14,22,0.98))] px-4 py-4 text-left",
  "transition hover:border-[var(--tone-info-border)] hover:bg-[linear-gradient(180deg,rgba(21,41,64,0.98),rgba(8,14,22,0.98))] hover:shadow-[0_16px_36px_rgba(109,199,255,0.08)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const topRow = clsx("flex items-start justify-between gap-3");

const dayLabel = clsx("text-sm font-semibold text-[var(--tone-info-text)]");

const weekday = clsx(
  "text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]",
);

const cardTitle = clsx("mt-3 text-lg font-semibold text-[var(--text-primary)]");

const exerciseList = clsx("mt-4 space-y-2");

const exerciseRow = clsx(
  "flex items-center justify-between gap-3 rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5",
);

const exerciseName = clsx("min-w-0 text-sm font-medium text-[var(--text-primary)]");

const exerciseTarget = clsx(
  "shrink-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--tone-info-text)]",
);

const fallback = clsx("mt-4 text-sm leading-6 text-[var(--text-muted)]");

const empty = clsx("mt-4 text-sm leading-6 text-[var(--text-muted)]");

export const upcomingDaysClasses = {
  wrapper,
  headingRow,
  title,
  description,
  list,
  card,
  topRow,
  dayLabel,
  weekday,
  cardTitle,
  exerciseList,
  exerciseRow,
  exerciseName,
  exerciseTarget,
  fallback,
  empty,
};
