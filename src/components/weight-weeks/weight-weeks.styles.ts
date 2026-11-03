import clsx from "clsx";

const list = clsx("m-0 flex list-none flex-col border-t border-ink p-0");

const row = clsx("grid grid-cols-[1fr_auto] items-center gap-3 border-b border-rule py-3.5");

const week = clsx("flex flex-col text-sm");

const range = clsx("font-semibold");

const count = clsx("text-muted");

const values = clsx("flex flex-col items-end");

const value = clsx("text-[1.0625rem] font-medium");

const change = clsx("font-mono text-xs text-muted");

export const weightWeeksClasses = {
  list,
  row,
  week,
  range,
  count,
  values,
  value,
  change,
};
