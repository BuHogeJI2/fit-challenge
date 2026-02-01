import clsx from "clsx";

const wrapper = clsx("flex flex-col gap-6");

const pill = clsx(
  "inline-flex items-center gap-3 rounded-full",
  "border border-emerald-400/30 bg-emerald-500/10",
  "px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200",
);

const layout = clsx("flex flex-col gap-4", "lg:flex-row lg:items-end lg:justify-between");

const title = clsx("text-3xl font-semibold text-slate-100", "sm:text-4xl");

const description = clsx("mt-3 max-w-2xl text-sm text-slate-300", "sm:text-base");

const statsCard = clsx(
  "rounded-2xl border border-slate-800/80 bg-slate-900/60",
  "px-5 py-4 text-sm text-slate-200 shadow-soft",
);

const statsLabel = clsx("text-xs uppercase tracking-[0.18em] text-slate-400");

const statsValue = clsx("mt-2 text-2xl font-semibold text-emerald-200");

const statsFooter = clsx("text-xs text-slate-400");

export const challengeHeaderClasses = {
  wrapper,
  pill,
  layout,
  title,
  description,
  statsCard,
  statsLabel,
  statsValue,
  statsFooter,
};
