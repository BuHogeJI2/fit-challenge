import clsx from "clsx";

const base = clsx("rounded-3xl p-6 text-sm");

const loading = clsx(
  base,
  "border border-slate-800/70 bg-slate-950/60 text-slate-300",
);

const error = clsx(
  base,
  "border border-rose-500/40 bg-rose-500/10 text-rose-200",
);

const empty = clsx(
  base,
  "border border-slate-800/70 bg-slate-950/60 text-slate-300",
);

const emptyHighlight = clsx("font-semibold text-slate-100");

export const statusBannerClasses = {
  loading,
  error,
  empty,
  emptyHighlight,
};
