import clsx from "clsx";

const wrapper = clsx(
  "relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)]",
  "bg-[linear-gradient(160deg,var(--tone-display-soft),rgba(13,23,34,0.96)_50%,rgba(8,14,22,0.98))]",
  "px-5 py-6 shadow-[0_30px_80px_rgba(3,8,20,0.45)] ring-1 ring-[rgba(255,255,255,0.03)]",
  "sm:px-6 sm:py-7",
);

const glow = clsx(
  "pointer-events-none absolute inset-x-0 top-0 h-28",
  "bg-[radial-gradient(circle_at_top,var(--tone-success-soft),transparent_68%)]",
);

const pillRow = clsx("relative flex flex-wrap items-center gap-2");

const pill = clsx(
  "inline-flex items-center rounded-full border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-3 py-1",
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]",
);

const title = clsx(
  "relative mt-5 max-w-3xl text-[2.1rem] font-semibold leading-[0.95] text-[var(--text-primary)]",
  "sm:text-[3rem]",
);

const description = clsx(
  "relative mt-4 max-w-2xl text-sm leading-6 text-[var(--text-muted)]",
  "sm:text-base",
);

const note = clsx(
  "relative mt-5 rounded-[1.4rem] border border-[var(--tone-neutral-border)] bg-[rgba(4,9,16,0.52)] px-4 py-3",
  "text-sm leading-6 text-[var(--text-secondary)]",
);

const stats = clsx("relative mt-5 grid grid-cols-2 gap-3 sm:max-w-xl");

const statCard = clsx(
  "rounded-[1.15rem] border border-[var(--tone-neutral-border)] bg-[rgba(255,255,255,0.035)] px-4 py-3",
  "backdrop-blur-sm",
);

const statLabel = clsx(
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]",
);

const statValue = clsx("mt-2 text-lg font-semibold text-[var(--text-primary)]");

export const challengeHeroClasses = {
  wrapper,
  glow,
  pillRow,
  pill,
  title,
  description,
  note,
  stats,
  statCard,
  statLabel,
  statValue,
};
