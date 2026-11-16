import clsx from "clsx";

const screen = clsx("flex flex-col pt-6");

const title = clsx("m-0 text-[2.75rem] leading-tight font-normal tracking-tight");

const subline = clsx("m-0 mt-1 text-sm text-muted");

const list = clsx("m-0 mt-6 flex list-none flex-col border-t border-ink p-0");

const item = clsx("border-b border-rule");

const row = clsx(
  "flex flex-col gap-2.5 py-4 no-underline",
  "hover:bg-ground-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const rowHead = clsx("flex items-baseline justify-between gap-4");

const name = clsx("text-2xl tracking-tight");

const when = clsx("shrink-0 text-sm text-muted");

const sentence = clsx("text-sm text-ink-soft");

const archived = clsx("mt-6 text-sm");

const archivedSummary = clsx(
  "flex min-h-11 cursor-pointer items-center text-muted hover:text-ink",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const archivedList = clsx("m-0 flex list-none flex-col p-0");

const archivedLink = clsx(
  "flex min-h-11 items-center border-b border-rule text-base text-ink-soft no-underline hover:text-ink",
);

const footer = clsx("mt-4 flex");

const fab = clsx(
  "fixed right-[max(1.5rem,calc((100vw-28rem)/2+1.5rem))] bottom-[max(1.75rem,env(safe-area-inset-bottom))] z-10",
  "flex size-15 cursor-pointer items-center justify-center rounded-full bg-ink",
  "hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const fabIcon = clsx("size-[22px] fill-none stroke-ground [stroke-linecap:round] [stroke-width:1.8]");
const views = clsx("my-3 flex gap-4 text-sm");
const view = clsx("min-h-11 text-muted focus-visible:outline-2 focus-visible:outline-ink");
const viewActive = clsx(view, "font-semibold text-ink underline underline-offset-6");
const period = clsx("mt-2 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2");
const periodTitle = clsx("m-0 text-center text-lg font-normal");
const arrow = clsx("size-11 rounded-full text-2xl hover:bg-ground-sunken disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ink");
const weekSummary = clsx("my-4 border-t border-rule pt-4");
const summaryCount = clsx("m-0 mb-1 text-base font-medium");
const trainingList = clsx("m-0 list-none border-t border-ink p-0");
const trainingItem = clsx("border-b border-rule py-4");
const day = clsx("m-0 mb-3 text-sm font-medium text-muted");
const trainingLink = clsx("flex min-h-11 items-center justify-between gap-3 no-underline focus-visible:outline-2 focus-visible:outline-ink hover:underline");
const trainingName = clsx("text-2xl tracking-tight");
const trainingNote = clsx("m-0 mt-1 text-sm whitespace-pre-wrap text-ink-soft");
const groupSummary = clsx("m-0 mt-2 flex list-none flex-col gap-2 p-0");
const summaryRow = clsx("flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm");
const metric = clsx("text-muted");
const empty = clsx("my-8 text-sm text-muted");

export const exercisesScreenClasses = {
  screen,
  title,
  subline,
  list,
  item,
  row,
  rowHead,
  name,
  when,
  sentence,
  archived,
  archivedSummary,
  archivedList,
  archivedLink,
  footer,
  fab,
  fabIcon,
  views, view, viewActive, period, periodTitle, arrow, weekSummary, summaryCount,
  trainingList, trainingItem, day, trainingLink, trainingName, trainingNote,
  groupSummary, summaryRow, metric, empty,
};
