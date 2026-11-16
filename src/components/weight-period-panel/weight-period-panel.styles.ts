import clsx from "clsx";

export const weightPanelClasses = {
  panel: clsx("flex flex-col"),
  header: clsx("mt-4 flex min-h-14 items-center justify-between gap-3"),
  title: clsx("m-0 text-[2.75rem] leading-tight font-normal tracking-tight"),
  weekTitle: clsx("m-0 text-2xl leading-tight font-normal tracking-tight"),
  arrows: clsx("flex shrink-0 gap-1"),
  arrow: clsx("size-11 rounded-full text-2xl hover:bg-ground-sunken disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ink"),
  meta: clsx("m-0 mt-2 text-sm text-muted"),
  chart: clsx("mt-4"),
  readout: clsx("flex min-h-11 items-center justify-between gap-3 text-sm"),
  readoutText: clsx("m-0 min-h-5 font-medium"),
  edit: clsx("min-h-11 shrink-0 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"),
  empty: clsx("my-12 text-center text-sm text-muted"),
};
