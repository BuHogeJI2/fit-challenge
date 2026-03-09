import clsx from "clsx";

const wrapper = clsx(
  "relative overflow-hidden rounded-[2rem] border border-white/10",
  "bg-[linear-gradient(160deg,rgba(242,97,63,0.24),rgba(12,18,33,0.92)_52%,rgba(182,255,79,0.12))]",
  "px-5 py-6 shadow-[0_30px_80px_rgba(3,8,20,0.45)]",
  "sm:px-6 sm:py-7",
);

const glow = clsx(
  "pointer-events-none absolute inset-x-0 top-0 h-28",
  "bg-[radial-gradient(circle_at_top,rgba(255,196,87,0.34),transparent_68%)]",
);

const pillRow = clsx("relative flex flex-wrap items-center gap-2");

const pill = clsx(
  "inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1",
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]",
);

const title = clsx(
  "relative mt-5 max-w-3xl text-[2.1rem] font-semibold leading-[0.95] text-[var(--ink-strong)]",
  "sm:text-[3rem]",
);

const description = clsx(
  "relative mt-4 max-w-2xl text-sm leading-6 text-[color:var(--ink-muted)]",
  "sm:text-base",
);

const note = clsx(
  "relative mt-5 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3",
  "text-sm leading-6 text-[var(--ink-soft)]",
);

const stats = clsx("relative mt-5 grid grid-cols-2 gap-3 sm:max-w-xl");

const statCard = clsx(
  "rounded-[1.4rem] border border-white/10 bg-black/15 px-4 py-3",
  "backdrop-blur-sm",
);

const statLabel = clsx(
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]",
);

const statValue = clsx("mt-2 text-lg font-semibold text-[var(--ink-strong)]");

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
