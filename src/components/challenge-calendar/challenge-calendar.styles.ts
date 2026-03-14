import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-[var(--border-subtle)] bg-[rgba(13,23,34,0.84)] px-5 py-5",
  "shadow-[0_22px_54px_rgba(3,8,20,0.34)]",
);

const header = clsx("flex items-center justify-between gap-3");

const title = clsx("text-xl font-semibold text-[var(--text-primary)]");

const subtitle = clsx("text-sm text-[var(--text-muted)]");

const monthSection = clsx("mt-5");

const monthTitle = clsx("text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]");

const weekRow = clsx("mt-3 grid grid-cols-7 gap-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const grid = clsx("mt-3 grid grid-cols-7 gap-2");

const emptyCell = clsx("aspect-square rounded-[1rem] border border-transparent");

const dayButtonBase = clsx(
  "flex aspect-square cursor-pointer items-center justify-center rounded-[1.1rem] border px-2.5 py-2 text-center transition",
  "sm:items-start sm:justify-between sm:text-left",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const dayButtonToday = clsx(
  "border-[var(--tone-info-border)] bg-[var(--tone-info-soft)] text-[var(--text-primary)]",
  "hover:border-[var(--tone-info-fill)]/55",
);

const dayButtonDone = clsx(
  "border-[var(--tone-success-border)] bg-[var(--tone-success-soft)] text-[var(--text-primary)]",
  "hover:border-[var(--tone-success-fill)]/55",
);

const dayButtonMissed = clsx(
  "border-[var(--tone-danger-border)] bg-[var(--tone-danger-soft)] text-[var(--text-primary)]",
  "hover:border-[rgba(255,125,114,0.34)] hover:bg-[rgba(255,125,114,0.16)]",
);

const dayButtonUpcoming = clsx(
  "border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.14)] text-[var(--text-muted)]",
  "hover:border-[var(--tone-neutral-border)] hover:bg-[rgba(255,255,255,0.04)]",
);

const dayNumber = clsx("text-sm font-semibold sm:text-[0.95rem]");

const state = clsx(
  "hidden text-[0.62rem] font-semibold uppercase tracking-[0.12em] sm:inline",
);

export const challengeCalendarClasses = {
  wrapper,
  header,
  title,
  subtitle,
  monthSection,
  monthTitle,
  weekRow,
  grid,
  emptyCell,
  dayButtonBase,
  dayButtonToday,
  dayButtonDone,
  dayButtonMissed,
  dayButtonUpcoming,
  dayNumber,
  state,
};
