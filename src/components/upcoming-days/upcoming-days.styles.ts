import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-white/10 bg-[rgba(10,15,28,0.84)] px-5 py-5",
  "shadow-[0_22px_54px_rgba(3,8,20,0.34)]",
);

const headingRow = clsx("flex items-center justify-between gap-3");

const title = clsx("text-xl font-semibold text-[var(--ink-strong)]");

const description = clsx("text-sm text-[var(--ink-muted)]");

const list = clsx("mt-4 space-y-3");

const card = clsx(
  "w-full cursor-pointer rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-left",
  "transition hover:border-[var(--brand-lime)]/30 hover:bg-white/8",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

const topRow = clsx("flex items-start justify-between gap-3");

const dayLabel = clsx("text-sm font-semibold text-[var(--brand-lime)]");

const date = clsx("text-sm text-[var(--ink-soft)]");

const cardTitle = clsx("mt-3 text-lg font-semibold text-[var(--ink-strong)]");

const meta = clsx("mt-2 text-sm leading-6 text-[var(--ink-muted)]");

const empty = clsx("mt-4 text-sm leading-6 text-[var(--ink-muted)]");

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
