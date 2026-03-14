import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(19,33,49,0.98),rgba(13,23,34,0.98))]",
  "px-5 py-5 shadow-[0_25px_60px_rgba(3,8,20,0.4)]",
);

const labelRow = clsx("flex flex-wrap items-center justify-between gap-3");

const pill = clsx(
  "inline-flex items-center rounded-full border border-[var(--tone-display-border)] bg-[var(--tone-display-soft)] px-3 py-1",
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--tone-display-text)]",
);

const date = clsx("text-sm font-medium text-[var(--text-secondary)]");

const title = clsx("mt-4 text-[1.85rem] font-semibold leading-none text-[var(--text-primary)]");

const description = clsx("mt-3 text-sm leading-6 text-[var(--text-muted)]");

const progressBanner = clsx(
  "mt-4 rounded-[1.3rem] border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-4 py-3",
);

const progressValue = clsx("text-lg font-semibold text-[var(--text-primary)]");

const progressMeta = clsx("mt-1 text-sm text-[var(--text-secondary)]");

const progressHint = clsx("mt-2 text-sm font-medium text-[var(--tone-success-text)]");

const stats = clsx("mt-5 grid grid-cols-2 gap-3");

const statCard = clsx(
  "rounded-[1.4rem] border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-4 py-3",
  "text-[var(--text-secondary)]",
);

const statLabel = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const statValue = clsx("mt-2 text-lg font-semibold text-[var(--text-primary)]");

const list = clsx("mt-5 space-y-3");

const item = clsx(
  "flex items-start justify-between gap-3 rounded-[1.25rem] border border-[var(--tone-neutral-border)] bg-[rgba(0,0,0,0.18)] px-4 py-3",
);

const itemMain = clsx("min-w-0 flex-1");

const itemHeading = clsx("flex flex-col gap-2");

const itemAccent = clsx(
  "h-[3px] w-16 origin-left rounded-full bg-[linear-gradient(90deg,var(--tone-display-fill),rgba(255,154,107,0.18)_58%,rgba(255,154,107,0.02))]",
  "shadow-[0_0_16px_rgba(255,154,107,0.18)]",
  "animate-exercise-accent",
);

const itemName = clsx(
  "text-[1.125rem] font-semibold leading-[1.15] text-[var(--text-primary)]",
);

const itemMeta = clsx("mt-2 text-sm text-[var(--text-muted)]");

const itemTarget = clsx(
  "inline-flex shrink-0 items-center rounded-full border border-[var(--tone-info-border)] bg-[var(--tone-info-soft)] px-3 py-1.5",
  "text-sm font-semibold text-[var(--tone-info-text)]",
);

const actions = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const actionButton = clsx(
  "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const readyButton = clsx(
  actionButton,
  "cursor-pointer border border-[var(--tone-success-border)] bg-[linear-gradient(180deg,var(--tone-success-strong),var(--tone-success-fill))]",
  "text-[var(--text-inverse)] shadow-[0_18px_36px_rgba(155,247,95,0.22)] hover:brightness-[1.04] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const primaryButton = clsx(
  actionButton,
  "cursor-pointer border border-[var(--tone-success-border)] bg-[var(--tone-success-soft)]",
  "text-[var(--text-primary)] shadow-[0_12px_28px_rgba(155,247,95,0.10)] hover:border-[var(--tone-success-fill)]/34 hover:bg-[rgba(155,247,95,0.2)] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const completedButton = clsx(
  actionButton,
  "cursor-pointer border border-[var(--tone-success-border)] bg-[var(--tone-success-soft)] text-[var(--tone-success-text)]",
  "hover:bg-[rgba(155,247,95,0.2)] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const secondaryButton = clsx(
  actionButton,
  "cursor-pointer border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)]",
  "text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.985] focus-visible:ring-[var(--tone-info-fill)]",
);

const disabledButton = clsx(
  actionButton,
  "cursor-not-allowed border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] text-[var(--text-primary)] opacity-60",
);

export const featuredDayCardClasses = {
  wrapper,
  labelRow,
  pill,
  date,
  title,
  description,
  progressBanner,
  progressValue,
  progressMeta,
  progressHint,
  stats,
  statCard,
  statLabel,
  statValue,
  list,
  item,
  itemMain,
  itemHeading,
  itemAccent,
  itemName,
  itemMeta,
  itemTarget,
  actions,
  readyButton,
  primaryButton,
  completedButton,
  secondaryButton,
  disabledButton,
};
