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
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/6 px-4",
  "text-sm font-semibold text-[var(--ink-strong)] transition hover:bg-white/10",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)]",
);

const changeNote = clsx(
  "mt-4 rounded-[1.2rem] border border-[var(--brand-hot)]/25 bg-[var(--brand-hot)]/10 px-4 py-3 text-sm text-[var(--brand-peach)]",
);

const summary = clsx("mt-4 text-sm leading-6 text-[var(--ink-muted)]");

const trackerNote = clsx("mt-4 text-sm leading-6 text-[var(--ink-soft)]");

const scrollArea = clsx("mt-5 overflow-y-auto pr-1");

const notesCard = clsx(
  "rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-[var(--ink-soft)]",
);

const sectionTitle = clsx("mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]");

const exerciseList = clsx("mt-5 space-y-3");

const exerciseCard = clsx(
  "rounded-[1.3rem] border border-white/10 bg-black/18 px-4 py-4",
);

const exerciseTop = clsx("flex items-start justify-between gap-3");

const exerciseMain = clsx("min-w-0");

const exerciseNameBadge = clsx(
  "inline-flex items-center rounded-full border border-[var(--brand-lime)]/25 bg-[var(--brand-lime)]/10 px-3 py-1",
  "text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand-lime)]",
);

const exerciseMeta = clsx("mt-1 text-sm text-[var(--ink-muted)]");

const exerciseTarget = clsx(
  "inline-flex shrink-0 items-center rounded-full border border-[var(--brand-hot)]/30 bg-[var(--brand-hot)]/12 px-3 py-1.5",
  "text-sm font-semibold text-[var(--brand-peach)]",
);

const trackerStats = clsx("mt-3 grid grid-cols-3 gap-2");

const trackerStat = clsx(
  "rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2",
);

const trackerStatLabel = clsx(
  "text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-dim)]",
);

const trackerStatValue = clsx("mt-1 text-base font-semibold text-[var(--ink-strong)]");

const inputRow = clsx("mt-3 flex flex-col gap-2 sm:flex-row");

const repsInput = clsx(
  "min-h-11 w-full rounded-[1rem] border border-white/12 bg-[rgba(255,255,255,0.04)] px-4 text-base text-[var(--ink-strong)]",
  "placeholder:text-[var(--ink-dim)] focus:border-[var(--brand-lime)]/45 focus:outline-none focus:ring-2 focus:ring-[var(--brand-lime)]/20",
);

const addSetButton = clsx(
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[1rem] border border-[var(--brand-peach)]/18 bg-[var(--brand-peach)]/10 px-4",
  "text-sm font-semibold text-[var(--ink-strong)] transition hover:border-[var(--brand-peach)]/30 hover:bg-[var(--brand-peach)]/14",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

const disabledAddSetButton = clsx(
  addSetButton,
  "cursor-not-allowed opacity-60 hover:border-[var(--brand-peach)]/18 hover:bg-[var(--brand-peach)]/10",
);

const setsList = clsx("mt-3 space-y-2");

const setItem = clsx(
  "flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2",
);

const setMeta = clsx("text-sm text-[var(--ink-soft)]");

const setValue = clsx("font-semibold text-[var(--ink-strong)]");

const removeSetButton = clsx(
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-[rgba(242,97,63,0.22)] bg-[rgba(242,97,63,0.08)] px-3 py-1",
  "text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-peach)] transition hover:border-[rgba(242,97,63,0.34)] hover:bg-[rgba(242,97,63,0.12)] hover:text-[var(--ink-strong)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-hot)]",
);

const actionRow = clsx("mt-5 flex flex-col gap-3 sm:flex-row");

const actionButton = clsx(
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold transition",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

const primaryAction = clsx(
  actionButton,
  "border border-[var(--brand-lime)]/22 bg-[var(--brand-lime)]/16",
  "text-[var(--ink-strong)] shadow-[0_12px_28px_rgba(182,255,79,0.10)] hover:border-[var(--brand-lime)]/34 hover:bg-[var(--brand-lime)]/20 active:scale-[0.985]",
);

const readyAction = clsx(
  actionButton,
  "border border-[var(--brand-lime)]/30 bg-[linear-gradient(180deg,rgba(182,255,79,0.96),rgba(147,230,70,0.96))]",
  "text-[var(--surface-900)] shadow-[0_18px_36px_rgba(182,255,79,0.22)] hover:brightness-[1.04] active:scale-[0.985]",
);

const completedAction = clsx(
  actionButton,
  "border border-[var(--brand-lime)]/25 bg-[var(--brand-lime)]/14 text-[var(--brand-lime)]",
  "hover:bg-[var(--brand-lime)]/18 active:scale-[0.985]",
);

const secondaryAction = clsx(
  actionButton,
  "border border-white/12 bg-white/6 text-[var(--ink-strong)] hover:bg-white/10 active:scale-[0.985]",
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
  exerciseNameBadge,
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
