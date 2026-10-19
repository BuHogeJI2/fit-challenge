import clsx from "clsx";

const list = clsx("m-0 flex list-none flex-col border-t border-ink p-0");

const item = clsx("border-b border-rule");

const row = clsx(
  "grid w-full cursor-pointer grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-3.5 text-left",
  "hover:bg-ground-sunken",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const date = clsx("flex flex-col text-sm");

const day = clsx("font-semibold");

const weekday = clsx("text-muted");

const note = clsx("truncate text-sm text-ink-soft");

const values = clsx("flex flex-col items-end");

const value = clsx("text-[1.0625rem] font-medium");

const change = clsx("font-mono text-xs text-muted");

export const weightJournalClasses = {
  list,
  item,
  row,
  date,
  day,
  weekday,
  note,
  values,
  value,
  change,
};
