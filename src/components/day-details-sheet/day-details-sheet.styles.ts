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
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-4",
  "text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[rgba(255,255,255,0.08)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)]",
);

const changeNote = clsx(
  "mt-4 rounded-[1.2rem] border border-[var(--tone-warning-border)] bg-[var(--tone-warning-soft)] px-4 py-3 text-sm text-[var(--tone-warning-text)]",
);

const summary = clsx("mt-4 text-sm leading-6 text-[var(--text-muted)]");

const trackerNote = clsx("mt-4 text-sm leading-6 text-[var(--text-secondary)]");

const scrollArea = clsx("mt-5 overflow-y-auto pr-1");

const notesCard = clsx(
  "rounded-[1.4rem] border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]",
);

const sectionTitle = clsx("mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const exerciseList = clsx("mt-5 space-y-3");

const exerciseCard = clsx(
  "rounded-[1.3rem] border border-[var(--tone-neutral-border)] bg-[rgba(0,0,0,0.18)] px-4 py-4",
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
  "inline-flex shrink-0 items-center rounded-full border border-[var(--tone-info-border)] bg-[var(--tone-info-soft)] px-3 py-1.5",
  "text-sm font-semibold text-[var(--tone-info-text)]",
);

const trackerStats = clsx("mt-3 grid grid-cols-3 gap-2");

const trackerStat = clsx(
  "rounded-[1rem] border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-3 py-2",
);

const trackerStatLabel = clsx(
  "text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]",
);

const trackerStatValue = clsx("mt-1 text-base font-semibold text-[var(--tone-info-text)]");

const inputRow = clsx("mt-3 flex flex-col gap-2 sm:flex-row");

const repsInput = clsx(
  "min-h-11 w-full rounded-[1rem] border border-[var(--tone-neutral-border)] bg-[rgba(255,255,255,0.04)] px-4 text-base text-[var(--text-primary)]",
  "placeholder:text-[var(--text-muted)] focus:border-[var(--tone-info-border)] focus:outline-none focus:ring-2 focus:ring-[var(--tone-info-soft)]",
);

const addSetButton = clsx(
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[1rem] border border-[var(--tone-info-border)] bg-[var(--tone-info-soft)] px-4",
  "text-sm font-semibold text-[var(--tone-info-text)] transition hover:border-[var(--tone-info-fill)]/42 hover:bg-[rgba(109,199,255,0.18)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const disabledAddSetButton = clsx(
  addSetButton,
  "cursor-not-allowed opacity-60 hover:border-[var(--tone-info-border)] hover:bg-[var(--tone-info-soft)]",
);

const setsList = clsx("mt-3 space-y-2");

const setItem = clsx(
  "flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] px-3 py-2",
);

const setMeta = clsx("text-sm text-[var(--text-secondary)]");

const setValue = clsx("font-semibold text-[var(--text-primary)]");

const removeSetButton = clsx(
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-[var(--tone-danger-border)] bg-[var(--tone-danger-soft)] px-3 py-1",
  "text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tone-danger-text)] transition hover:border-[rgba(255,125,114,0.34)] hover:bg-[rgba(255,125,114,0.16)] hover:text-[var(--text-primary)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-danger-fill)]",
);

const actionRow = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const actionButton = clsx(
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold transition",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const primaryAction = clsx(
  actionButton,
  "border border-[var(--tone-success-border)] bg-[var(--tone-success-soft)]",
  "text-[var(--text-primary)] shadow-[0_12px_28px_rgba(155,247,95,0.10)] hover:border-[var(--tone-success-fill)]/34 hover:bg-[rgba(155,247,95,0.2)] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const readyAction = clsx(
  actionButton,
  "border border-[var(--tone-success-border)] bg-[linear-gradient(180deg,var(--tone-success-strong),var(--tone-success-fill))]",
  "text-[var(--text-inverse)] shadow-[0_18px_36px_rgba(155,247,95,0.22)] hover:brightness-[1.04] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const completedAction = clsx(
  actionButton,
  "border border-[var(--tone-success-border)] bg-[var(--tone-success-soft)] text-[var(--tone-success-text)]",
  "hover:bg-[rgba(155,247,95,0.2)] active:scale-[0.985] focus-visible:ring-[var(--tone-success-fill)]",
);

const secondaryAction = clsx(
  actionButton,
  "border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.985] focus-visible:ring-[var(--tone-info-fill)]",
);

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
  trackerStats,
  trackerStat,
  trackerStatLabel,
  trackerStatValue,
  inputRow,
  repsInput,
  addSetButton,
  disabledAddSetButton,
  setsList,
  setItem,
  setMeta,
  setValue,
  removeSetButton,
  actionRow,
  primaryAction,
  readyAction,
  completedAction,
  secondaryAction,
};
