import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-[var(--border-subtle)] bg-[rgba(13,23,34,0.84)] px-5 py-5",
  "shadow-[0_22px_54px_rgba(3,8,20,0.34)]",
);

const headingRow = clsx("flex items-center justify-between gap-3");

const title = clsx("text-xl font-semibold text-[var(--text-primary)]");

const description = clsx("text-sm text-[var(--text-muted)]");

const list = clsx("mt-4 space-y-3");

const card = clsx(
  "w-full cursor-pointer rounded-[1.4rem] border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-4 py-4 text-left",
  "transition hover:border-[var(--tone-info-border)] hover:bg-[rgba(109,199,255,0.08)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const topRow = clsx("flex items-start justify-between gap-3");

const dayLabel = clsx("text-sm font-semibold text-[var(--tone-info-text)]");

const date = clsx("text-sm text-[var(--text-secondary)]");

const cardTitle = clsx("mt-3 text-lg font-semibold text-[var(--text-primary)]");

const meta = clsx("mt-2 text-sm leading-6 text-[var(--text-muted)]");

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
  date,
  cardTitle,
  meta,
  empty,
};
