import clsx from "clsx";

const wrapper = clsx(
  "rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(19,33,49,0.98),rgba(8,14,22,0.98))]",
  "px-5 py-5 shadow-[0_25px_60px_rgba(3,8,20,0.4)] ring-1 ring-[rgba(255,255,255,0.03)]",
);

const completedWrapper = clsx(
  "rounded-[2rem] border border-[var(--tone-success-border)] bg-[linear-gradient(180deg,rgba(24,42,28,0.98),rgba(8,14,22,0.98))]",
  "px-5 py-5 shadow-[0_28px_68px_rgba(155,247,95,0.12)] ring-1 ring-[rgba(155,247,95,0.16)]",
);

const labelRow = clsx("flex flex-wrap items-center justify-between gap-3");

const pill = clsx(
  "inline-flex items-center rounded-full border border-[var(--tone-display-border)] bg-[var(--tone-display-soft)] px-3 py-1",
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--tone-display-text)]",
);

const completedPill = clsx(
  "inline-flex items-center rounded-full border border-[var(--tone-success-border)] bg-[var(--tone-success-soft)] px-3 py-1",
  "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--tone-success-text)]",
);

const date = clsx("text-sm font-medium text-[var(--text-secondary)]");

const title = clsx("mt-4 text-[1.85rem] font-semibold leading-none text-[var(--text-primary)]");

const description = clsx("mt-3 text-sm leading-6 text-[var(--text-muted)]");

const completedCallout = clsx(
  "mt-4 rounded-[1.1rem] border border-[var(--tone-success-border)] bg-[rgba(155,247,95,0.10)] px-4 py-3",
  "text-sm font-medium leading-6 text-[var(--tone-success-text)]",
);

const progressBanner = clsx(
  "mt-4 px-4 py-4",
);

const progressValue = clsx("text-lg font-semibold text-[var(--text-primary)]");

const progressMeta = clsx("mt-1 text-sm text-[var(--text-secondary)]");

const progressHint = clsx("mt-2 text-sm font-medium text-[var(--tone-success-text)]");

const stats = clsx("mt-5 grid grid-cols-2 gap-3");

const statCard = clsx(
  "px-4 py-3",
  "text-[var(--text-secondary)]",
);

const statLabel = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const statValue = clsx("mt-2 text-lg font-semibold text-[var(--text-primary)]");

const list = clsx("mt-5 space-y-3");

const itemBase = clsx(
  "flex w-full items-start justify-between gap-3 rounded-[1.3rem] border px-4 py-4 text-left transition",
);

const itemPanel = clsx(
  itemBase,
  "border-[var(--border-strong)] px-4 py-4",
);

const itemButton = clsx(
  itemBase,
  "cursor-pointer border-[var(--tone-info-border)] bg-[rgba(109,199,255,0.08)] shadow-[0_14px_34px_rgba(109,199,255,0.08)]",
  "hover:border-[var(--tone-info-fill)] hover:bg-[rgba(109,199,255,0.12)] active:scale-[0.992]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const itemButtonComplete = clsx(
  itemBase,
  "cursor-pointer border-[var(--tone-success-border)] bg-[rgba(155,247,95,0.08)] shadow-[0_14px_34px_rgba(155,247,95,0.08)]",
  "hover:border-[var(--tone-success-fill)] hover:bg-[rgba(155,247,95,0.12)] active:scale-[0.992]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-success-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
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

const itemMetaRow = clsx("mt-2 flex flex-wrap items-center justify-between gap-2");

const itemHint = clsx(
  "text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--tone-info-text)]",
);

const itemHintPassive = clsx(
  "text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]",
);

const itemAside = clsx("flex shrink-0 flex-col items-end gap-2");

const itemTarget = clsx("text-sm");

const itemSetMeta = clsx("text-xs font-medium text-[var(--text-secondary)]");

const actions = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const readyButton = clsx(
  "w-full sm:w-auto border-[var(--tone-success-border)] bg-[linear-gradient(180deg,var(--tone-success-strong),var(--tone-success-fill))]",
  "cursor-pointer border border-[var(--tone-success-border)] bg-[linear-gradient(180deg,var(--tone-success-strong),var(--tone-success-fill))]",
  "!text-[var(--text-inverse)] shadow-[0_18px_36px_rgba(155,247,95,0.22)] hover:brightness-[1.04] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const primaryButton = clsx(
  "w-full sm:w-auto border-[var(--tone-success-border)] bg-[var(--tone-success-soft)]",
  "cursor-pointer border border-[var(--tone-success-border)] bg-[var(--tone-success-soft)]",
  "text-[var(--text-primary)] shadow-[0_12px_28px_rgba(155,247,95,0.10)] hover:border-[var(--tone-success-fill)]/34 hover:bg-[rgba(155,247,95,0.2)] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const completedButton = clsx(
  "w-full sm:w-auto border-[var(--tone-success-border)] bg-[var(--tone-success-soft)]",
  "cursor-pointer border border-[var(--tone-success-border)] bg-[var(--tone-success-soft)] text-[var(--tone-success-text)]",
  "hover:bg-[rgba(155,247,95,0.2)] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const secondaryButton = clsx(
  "w-full sm:w-auto",
);

const disabledButton = clsx(
  "w-full cursor-not-allowed sm:w-auto",
);

export const featuredDayCardClasses = {
  wrapper,
  completedWrapper,
  labelRow,
  pill,
  completedPill,
  date,
  title,
  completedCallout,
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
  itemPanel,
  itemButton,
  itemButtonComplete,
  itemMain,
  itemHeading,
  itemAccent,
  itemName,
  itemMeta,
  itemMetaRow,
  itemHint,
  itemHintPassive,
  itemAside,
  itemTarget,
  itemSetMeta,
  actions,
  readyButton,
  primaryButton,
  completedButton,
  secondaryButton,
  disabledButton,
};
