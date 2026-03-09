import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-white/10 bg-[rgba(10,15,28,0.84)] px-5 py-5",
  "shadow-[0_22px_54px_rgba(3,8,20,0.34)]",
);

const header = clsx("flex items-center justify-between gap-3");

const title = clsx("text-xl font-semibold text-[var(--ink-strong)]");

const subtitle = clsx("text-sm text-[var(--ink-muted)]");

const monthSection = clsx("mt-5");

const monthTitle = clsx("text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]");

const weekRow = clsx("mt-3 grid grid-cols-7 gap-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]");

const grid = clsx("mt-3 grid grid-cols-7 gap-2");

const emptyCell = clsx("aspect-square rounded-[1rem] border border-transparent");

const dayButtonBase = clsx(
  "flex aspect-square cursor-pointer items-center justify-center rounded-[1.1rem] border px-2.5 py-2 text-center transition",
  "sm:items-start sm:justify-between sm:text-left",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

const dayButtonToday = clsx(
  "border-[var(--brand-hot)]/40 bg-[var(--brand-hot)]/12 text-[var(--ink-strong)]",
  "hover:border-[var(--brand-hot)]/60",
);

const dayButtonDone = clsx(
  "border-[var(--brand-lime)]/35 bg-[var(--brand-lime)]/12 text-[var(--ink-strong)]",
  "hover:border-[var(--brand-lime)]/55",
);

const dayButtonElapsed = clsx(
  "border-white/10 bg-white/6 text-[var(--ink-soft)]",
  "hover:border-white/20 hover:bg-white/10",
);

const dayButtonUpcoming = clsx(
  "border-white/8 bg-black/16 text-[var(--ink-muted)]",
  "hover:border-white/18 hover:bg-white/7",
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
  dayButtonElapsed,
  dayButtonUpcoming,
  dayNumber,
  state,
};
