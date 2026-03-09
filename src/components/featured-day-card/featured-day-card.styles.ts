import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,26,48,0.96),rgba(10,15,28,0.96))]",
  "px-5 py-5 shadow-[0_25px_60px_rgba(3,8,20,0.4)]",
);

const labelRow = clsx("flex flex-wrap items-center justify-between gap-3");

const pill = clsx(
  "inline-flex items-center rounded-full border border-[var(--brand-hot)]/25 bg-[var(--brand-hot)]/12 px-3 py-1",
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-peach)]",
);

const date = clsx("text-sm font-medium text-[var(--ink-soft)]");

const title = clsx("mt-4 text-[1.85rem] font-semibold leading-none text-[var(--ink-strong)]");

const description = clsx("mt-3 text-sm leading-6 text-[var(--ink-muted)]");

const stats = clsx("mt-5 grid grid-cols-2 gap-3");

const statCard = clsx(
  "rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3",
  "text-[var(--ink-soft)]",
);

const statLabel = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]");

const statValue = clsx("mt-2 text-lg font-semibold text-[var(--ink-strong)]");

const list = clsx("mt-5 space-y-3");

const item = clsx(
  "flex items-start justify-between gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3",
);

const itemMain = clsx("min-w-0");

const itemNameBadge = clsx(
  "inline-flex items-center rounded-full border border-[var(--brand-hot)]/25 bg-[var(--brand-hot)]/10 px-3 py-1",
  "text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand-peach)]",
);

const itemMeta = clsx("mt-1 text-sm text-[var(--ink-muted)]");

const itemTarget = clsx(
  "inline-flex shrink-0 items-center rounded-full border border-[var(--brand-lime)]/30 bg-[var(--brand-lime)]/14 px-3 py-1.5",
  "text-sm font-semibold text-[var(--brand-lime)]",
);

const actions = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const primaryButton = clsx(
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[var(--brand-peach)]/18 bg-[var(--brand-peach)]/10 px-5",
  "text-sm font-semibold text-[var(--ink-strong)] transition hover:border-[var(--brand-peach)]/30 hover:bg-[var(--brand-peach)]/14",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

const secondaryButton = clsx(
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/6 px-5",
  "text-sm font-semibold text-[var(--ink-strong)] transition hover:bg-white/10",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

const disabledButton = clsx(
  secondaryButton,
  "cursor-not-allowed opacity-60 hover:bg-white/6 hover:border-white/12",
);

export const featuredDayCardClasses = {
  wrapper,
  labelRow,
  pill,
  date,
  title,
  description,
  stats,
  statCard,
  statLabel,
  statValue,
  list,
  item,
  itemMain,
  itemNameBadge,
  itemMeta,
  itemTarget,
  actions,
  primaryButton,
  secondaryButton,
  disabledButton,
};
