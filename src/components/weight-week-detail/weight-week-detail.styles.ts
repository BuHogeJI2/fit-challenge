import clsx from "clsx";

export const weightWeekClasses = {
  screen: clsx("flex flex-col pt-2"),
  back: clsx("flex min-h-11 items-center text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"),
  period: clsx("mt-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2"),
  title: clsx("m-0 text-center text-2xl font-normal tracking-tight"),
  arrow: clsx("size-11 rounded-full text-2xl hover:bg-ground-sunken disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ink"),
  subline: clsx("m-0 mt-2 text-sm text-muted"),
  chart: clsx("mt-5"),
  readout: clsx("flex min-h-11 items-center justify-between gap-3 text-sm"),
  readoutText: clsx("m-0 font-medium"),
  edit: clsx("min-h-11 shrink-0 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"),
  summary: clsx("m-0 mt-4 grid grid-cols-3 gap-3 border-t border-rule pt-4 text-sm"),
  label: clsx("text-xs text-muted"),
  value: clsx("m-0 mt-1 font-medium"),
  date: clsx("block text-xs font-normal text-muted"),
  empty: clsx("my-10 text-sm text-muted"),
};
