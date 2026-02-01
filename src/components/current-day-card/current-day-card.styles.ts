import clsx from "clsx";

const card = clsx(
  "rounded-3xl border border-emerald-500/40 bg-emerald-500/10",
  "p-6 shadow-soft",
);

const header = clsx(
  "flex items-center justify-between",
  "text-xs uppercase tracking-[0.2em] text-emerald-200",
);

const title = clsx("mt-4 text-2xl font-semibold text-white");

const description = clsx("mt-1 text-sm text-emerald-100/80");

const content = clsx(
  "mt-6 rounded-2xl border border-emerald-500/30",
  "bg-slate-950/40 p-5",
);

const list = clsx("space-y-3 text-sm text-slate-100");

const listItem = clsx("flex gap-3");

const bullet = clsx(
  "mt-1 inline-flex h-2.5 w-2.5 shrink-0",
  "rounded-full bg-emerald-300",
);

const empty = clsx("text-sm text-slate-300");

export const currentDayCardClasses = {
  card,
  header,
  title,
  description,
  content,
  list,
  listItem,
  bullet,
  empty,
};
