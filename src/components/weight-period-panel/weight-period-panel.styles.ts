import clsx from "clsx";

export const weightPanelClasses = {
  panel: clsx("flex flex-col"),
  header: clsx("mt-4 flex min-h-14 items-center justify-between gap-3"),
  title: clsx("m-0 min-w-0 text-[1.75rem] leading-tight font-normal tracking-tight text-balance"),
  arrows: clsx("flex shrink-0 gap-1"),
  arrow: clsx("size-11 rounded-full text-2xl hover:bg-ground-sunken disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ink"),
  meta: clsx("m-0 mt-2 text-sm text-muted"),
  chart: clsx("mt-4"),
  legend: clsx("m-0 mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted"),
  legendItem: clsx("flex items-center gap-1.5"),
  averageMark: clsx("h-0.5 w-4 bg-ink"),
  entryMark: clsx("size-1 rounded-full bg-muted"),
  readout: clsx("flex min-h-11 items-center justify-between gap-3 text-sm"),
  readoutText: clsx("m-0 min-h-5 font-medium"),
  edit: clsx("shrink-0"),
  empty: clsx("my-12 text-center text-sm text-muted"),
};
