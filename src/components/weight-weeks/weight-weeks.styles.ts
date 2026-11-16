import clsx from "clsx";

const list = clsx("m-0 flex list-none flex-col p-0");
const item = clsx("border-b border-rule last:border-b-0");

const row = clsx("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-4 no-underline hover:bg-ground-sunken focus-visible:outline-2 focus-visible:outline-ink");
const chevron = clsx("text-lg text-muted");
const rowHead = clsx("flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1");
const rowMeta = clsx("mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-muted");
const heading = clsx("m-0 mt-6 text-sm font-medium");
const description = clsx("m-0 mt-1 mb-2 text-xs text-muted");

const week = clsx("min-w-0 text-sm");

const range = clsx("font-semibold");

const count = clsx("text-muted");

const value = clsx("whitespace-nowrap text-base font-medium");

const change = clsx("font-mono text-xs text-muted");
const srOnly = clsx("sr-only");

export const weightWeeksClasses = {
  list,
  item,
  row,
  rowHead,
  rowMeta,
  heading,
  description,
  chevron,
  week,
  range,
  count,
  value,
  change,
  srOnly,
};
