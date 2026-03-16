import clsx from "clsx";

const overlay = clsx(
  "fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm",
  "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
);

const content = clsx(
  "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-3xl flex-col",
  "rounded-t-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 pb-6 pt-5 shadow-[0_-24px_80px_rgba(0,0,0,0.45)]",
  "data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out",
  "sm:bottom-6 sm:rounded-[2rem] sm:px-6 sm:pt-6",
);

const handle = clsx("mx-auto h-1.5 w-14 rounded-full bg-[var(--border-subtle)] sm:hidden");

const header = clsx("mt-4 flex items-start justify-between gap-4 sm:mt-0");

const eyebrow = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--tone-info-text)]");

const title = clsx("mt-2 text-2xl font-semibold text-[var(--text-primary)]");

const date = clsx("mt-2 text-sm text-[var(--text-secondary)]");

const closeButton = clsx(
  "self-start sm:self-auto",
);

const changeNote = clsx(
  "mt-4 rounded-[1.2rem] border border-[var(--tone-warning-border)] bg-[var(--tone-warning-soft)] px-4 py-3 text-sm text-[var(--tone-warning-text)]",
);

const summary = clsx("mt-4 text-sm leading-6 text-[var(--text-muted)]");

const trackerNote = clsx("mt-4 text-sm leading-6 text-[var(--text-secondary)]");

const scrollArea = clsx("mt-5 overflow-y-auto pr-1");

const notesCard = clsx(
  "px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]",
);

const sectionTitle = clsx("mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const exerciseList = clsx("mt-5 space-y-4");

const exerciseCard = clsx(
  "px-4 py-4",
);

const exerciseTop = clsx("flex items-start justify-between gap-3");

const exerciseMain = clsx("min-w-0");

const exerciseHeading = clsx("flex flex-col gap-2");

const exerciseAccent = clsx(
  "h-[3px] w-20 origin-left rounded-full bg-[linear-gradient(90deg,var(--tone-display-fill),rgba(255,154,107,0.18)_58%,rgba(255,154,107,0.02))]",
  "shadow-[0_0_16px_rgba(255,154,107,0.18)]",
  "animate-exercise-accent",
);

const exerciseName = clsx(
  "text-[1.25rem] font-semibold leading-[1.15] text-[var(--text-primary)]",
);

const exerciseMeta = clsx("mt-2 text-sm text-[var(--text-muted)]");

const exerciseTarget = clsx(
  "text-sm",
);

const exerciseTopActions = clsx(
  "flex shrink-0 flex-col items-end gap-2",
);

const exerciseCompletedBadge = clsx("text-xs");

const trackerStats = clsx("mt-4 grid grid-cols-3 gap-2");

const trackerStat = clsx("px-3 py-2.5");

const trackerStatLabel = clsx(
  "text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]",
);

const trackerStatValue = clsx("mt-1 text-base font-semibold text-[var(--text-primary)]");

const actionRow = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const pastActions = clsx(
  "mt-5 rounded-[1.4rem] border border-[var(--tone-info-border)] bg-[rgba(109,199,255,0.08)] px-4 py-4",
  "shadow-[0_14px_34px_rgba(109,199,255,0.08)]",
);

const pastActionsTitle = clsx("text-sm font-semibold text-[var(--text-primary)]");

const pastActionsMeta = clsx("mt-1 text-sm leading-6 text-[var(--text-secondary)]");

const pastActionsButtons = clsx("mt-4 flex flex-col gap-3 sm:flex-row");

const primaryAction = clsx("w-full sm:w-auto");

const secondaryAction = clsx("w-full sm:w-auto");

export const dayDetailsSheetClasses = {
  overlay,
  content,
  handle,
  header,
  eyebrow,
  title,
  date,
  closeButton,
  changeNote,
  summary,
  trackerNote,
  scrollArea,
  notesCard,
  sectionTitle,
  exerciseList,
  exerciseCard,
  exerciseTop,
  exerciseMain,
  exerciseHeading,
  exerciseAccent,
  exerciseName,
  exerciseMeta,
  exerciseTarget,
  exerciseTopActions,
  exerciseCompletedBadge,
  trackerStats,
  trackerStat,
  trackerStatLabel,
  trackerStatValue,
  actionRow,
  pastActions,
  pastActionsTitle,
  pastActionsMeta,
  pastActionsButtons,
  primaryAction,
  secondaryAction,
};
