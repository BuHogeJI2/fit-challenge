import clsx from "clsx";

const card = clsx(
  "rounded-3xl border border-slate-800/80 bg-slate-900/60",
  "p-6 shadow-soft",
);

const label = clsx("text-xs uppercase tracking-[0.2em] text-slate-400");

const title = clsx("mt-3 text-2xl font-semibold text-white");

const weekRow = clsx(
  "mt-4 grid grid-cols-7 gap-2",
  "text-[11px] uppercase tracking-[0.2em] text-slate-500",
);

const weekCell = clsx("text-center");

const grid = clsx("mt-3 grid grid-cols-7 gap-2");

const dayCardBase = clsx(
  "relative flex flex-col justify-center gap-2",
  "rounded-2xl border px-2.5 py-2.5 text-xs transition",
);

const dayCardToday = clsx(
  "border-sky-400/70 bg-sky-500/15 text-sky-50",
  "shadow-[0_0_0_1px_rgba(56,189,248,0.35)]",
);

const dayCardLocked = clsx(
  "border-slate-900/80 bg-slate-950/70 text-slate-600",
);

const dayCardFuture = clsx(
  "border-slate-800/70 bg-slate-950/60 text-slate-500",
);

const dayCardPast = clsx("border-slate-800/80 bg-slate-900/70 text-slate-300");

const dayCardDone = clsx(
  "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
);

const dayHeader = clsx("flex min-w-0 items-center justify-center gap-2");

const dayNumber = clsx("shrink-0 text-sm font-semibold cursor-default");

const daySummary = clsx("truncate text-[11px] leading-tight text-slate-400");

const tooltipWrapper = clsx("absolute inset-0 pointer-events-none");

const iconMuted = clsx(
  "inline-flex h-6 w-6 items-center justify-center rounded-full",
  "border border-slate-700/70 bg-slate-950/70",
  "text-[10px] text-slate-500",
);

const iconDone = clsx(
  "inline-flex h-6 w-6 items-center justify-center rounded-full",
  "border border-emerald-400/50 bg-emerald-500/15",
  "text-xs font-semibold text-emerald-100",
);

const iconMissed = clsx(
  "inline-flex h-6 w-6 items-center justify-center rounded-full",
  "border border-rose-400/40 bg-rose-500/10",
  "text-xs font-semibold text-rose-200",
);

export const monthOverviewClasses = {
  card,
  label,
  title,
  weekRow,
  weekCell,
  grid,
  dayCardBase,
  dayCardToday,
  dayCardLocked,
  dayCardFuture,
  dayCardPast,
  dayCardDone,
  dayHeader,
  dayNumber,
  daySummary,
  tooltipWrapper,
  iconMuted,
  iconDone,
  iconMissed,
};
