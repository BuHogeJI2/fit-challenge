import clsx from "clsx";

const list = clsx("m-0 flex list-none flex-col p-0");

const item = clsx("border-b border-rule last:border-b-0");
const revealedItem = clsx(item, "motion-reveal");

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
const heading = clsx("m-0 mt-5 mb-2 text-sm font-medium text-muted");
const disclosure = clsx("mt-3 self-start");

export const weightJournalClasses = {
  list,
  item,
  revealedItem,
  row,
  date,
  day,
  weekday,
  note,
  values,
  value,
  change,
  heading,
  disclosure,
};
