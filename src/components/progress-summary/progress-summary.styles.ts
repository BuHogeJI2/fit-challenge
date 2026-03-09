import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-white/10 bg-[rgba(12,18,33,0.88)] px-5 py-5",
  "shadow-[0_22px_54px_rgba(3,8,20,0.34)]",
);

const header = clsx("flex flex-wrap items-center justify-between gap-3");

const title = clsx("text-xl font-semibold text-[var(--ink-strong)]");

const phase = clsx("text-sm text-[var(--ink-muted)]");

const grid = clsx("mt-4 grid gap-3 sm:grid-cols-3");

const card = clsx(
  "rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4",
  "backdrop-blur-sm",
);

const label = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]");

const value = clsx("mt-2 text-2xl font-semibold text-[var(--ink-strong)]");

const meta = clsx("mt-1 text-sm text-[var(--ink-muted)]");

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
