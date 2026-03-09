import clsx from "clsx";

const overlay = clsx(
  "fixed inset-0 z-40 bg-[rgba(3,8,20,0.72)] backdrop-blur-sm",
  "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
);

const content = clsx(
  "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-3xl flex-col",
  "rounded-t-[2rem] border border-white/12 bg-[var(--surface-900)] px-5 pb-6 pt-5 shadow-[0_-24px_80px_rgba(0,0,0,0.45)]",
  "data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out",
  "sm:bottom-6 sm:rounded-[2rem] sm:px-6 sm:pt-6",
);

const handle = clsx("mx-auto h-1.5 w-14 rounded-full bg-white/16 sm:hidden");

const header = clsx("mt-4 flex items-start justify-between gap-4 sm:mt-0");

const eyebrow = clsx("text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-lime)]");

const title = clsx("mt-2 text-2xl font-semibold text-[var(--ink-strong)]");

const date = clsx("mt-2 text-sm text-[var(--ink-soft)]");

const closeButton = clsx(
  "inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 bg-white/6 px-4",
  "text-sm font-semibold text-[var(--ink-strong)] transition hover:bg-white/10",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)]",
);

const changeNote = clsx(
  "mt-4 rounded-[1.2rem] border border-[var(--brand-hot)]/25 bg-[var(--brand-hot)]/10 px-4 py-3 text-sm text-[var(--brand-peach)]",
);

const summary = clsx("mt-4 text-sm leading-6 text-[var(--ink-muted)]");

const scrollArea = clsx("mt-5 overflow-y-auto pr-1");

const notesCard = clsx(
  "rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-[var(--ink-soft)]",
);

const sectionTitle = clsx("mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]");

const exerciseList = clsx("mt-5 space-y-3");

const exerciseCard = clsx(
  "rounded-[1.3rem] border border-white/10 bg-black/18 px-4 py-4",
);

const exerciseName = clsx("text-base font-semibold text-[var(--ink-strong)]");

const exerciseMeta = clsx("mt-1 text-sm text-[var(--ink-muted)]");

const actionRow = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const actionButton = clsx(
  "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

const primaryAction = clsx(actionButton, "bg-[var(--brand-hot)] text-[var(--surface-900)] hover:brightness-110");

const secondaryAction = clsx(actionButton, "border border-white/12 bg-white/6 text-[var(--ink-strong)] hover:bg-white/10");

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
  scrollArea,
  notesCard,
  sectionTitle,
  exerciseList,
  exerciseCard,
  exerciseName,
  exerciseMeta,
  actionRow,
  primaryAction,
  secondaryAction,
};
