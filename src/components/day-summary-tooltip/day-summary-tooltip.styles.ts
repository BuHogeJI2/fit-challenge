import clsx from "clsx";

const tooltip = clsx(
  "absolute left-1/2 top-1/2 z-10",
  "-translate-x-1/2 -translate-y-1/2",
  "w-[10rem] rounded-xl border border-slate-700/80",
  "bg-slate-950/95 px-4 py-3",
  "text-slate-200 shadow-lg pointer-events-none",
  "backdrop-blur",
);

const date = clsx("text-[13px] font-semibold text-slate-100");

const exercises = clsx("mt-2 text-xs text-slate-300 uppercase");

export const daySummaryTooltipClasses = {
  tooltip,
  date,
  exercises,
};
