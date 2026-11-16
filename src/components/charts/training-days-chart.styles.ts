import clsx from "clsx";

export const trainingDaysChartClasses = {
  svg: clsx("block h-auto w-full overflow-visible"),
  bar: clsx("fill-ink"),
  count: clsx("fill-ink font-mono text-[12px]"),
  empty: clsx("stroke-rule-strong [stroke-linecap:round] [stroke-width:2]"),
  weekday: clsx("fill-ink-soft text-[11px]"),
  weekdayLater: clsx("fill-muted text-[11px]"),
  day: clsx("fill-muted font-mono text-[10px]"),
};
