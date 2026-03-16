import clsx from "clsx";

const overlay = clsx(
  "fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm",
  "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
);

const content = clsx(
  "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-2xl flex-col",
  "rounded-t-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 pb-6 pt-5 shadow-[0_-24px_80px_rgba(0,0,0,0.45)]",
  "data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out",
  "sm:bottom-6 sm:rounded-[2rem] sm:px-6 sm:pt-6",
);

const handle = clsx("mx-auto h-1.5 w-14 rounded-full bg-[var(--border-subtle)] sm:hidden");

const header = clsx("mt-4 flex items-start justify-between gap-4 sm:mt-0");

const eyebrow = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--tone-info-text)]");

const title = clsx("mt-2 text-2xl font-semibold text-[var(--text-primary)]");

const date = clsx("mt-2 text-sm text-[var(--text-secondary)]");

const closeButton = clsx("self-start sm:self-auto");

const helper = clsx("mt-4 text-sm leading-6 text-[var(--text-secondary)]");

const scrollArea = clsx("mt-5 overflow-y-auto pr-1");

const summaryCard = clsx("px-4 py-4");

const exercisePicker = clsx("mt-4 space-y-3");

const exercisePickerButton = clsx(
  "flex w-full items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--tone-info-border)] bg-[rgba(109,199,255,0.08)] px-4 py-4 text-left transition",
  "hover:border-[var(--tone-info-fill)] hover:bg-[rgba(109,199,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

const exercisePickerMain = clsx("min-w-0");

const exercisePickerName = clsx("text-base font-semibold text-[var(--text-primary)]");

const exercisePickerMeta = clsx("mt-1 text-sm text-[var(--text-muted)]");

const summaryTitle = clsx("text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]");

const summaryBody = clsx("mt-2 text-sm leading-6 text-[var(--text-secondary)]");

const summaryMetrics = clsx("mt-4 flex flex-wrap items-center gap-2");

const summaryMetric = clsx("text-sm");

const summarySetCount = clsx(
  "text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]",
);

const formBlock = clsx("mt-4 px-4 py-4");

const formLabel = clsx("text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--tone-info-text)]");

const formHint = clsx("mt-1 text-sm text-[var(--text-secondary)]");

const inputRow = clsx("mt-3 flex items-center gap-2");

const repsInput = clsx("w-[7.5rem] min-w-0");

const addSetButton = clsx("min-w-[132px] flex-1");

const targetBadgeRow = clsx("mt-4 flex flex-wrap items-center gap-2");

const notesCard = clsx("mt-4 px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]");

const actionRow = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const secondaryAction = clsx("w-full sm:w-auto");

export const exerciseTrackerSheetClasses = {
  overlay,
  content,
  handle,
  header,
  eyebrow,
  title,
  date,
  closeButton,
  helper,
  scrollArea,
  summaryCard,
  exercisePicker,
  exercisePickerButton,
  exercisePickerMain,
  exercisePickerName,
  exercisePickerMeta,
  summaryTitle,
  summaryBody,
  summaryMetrics,
  summaryMetric,
  summarySetCount,
  formBlock,
  formLabel,
  formHint,
  inputRow,
  repsInput,
  addSetButton,
  targetBadgeRow,
  notesCard,
  actionRow,
  secondaryAction,
};
