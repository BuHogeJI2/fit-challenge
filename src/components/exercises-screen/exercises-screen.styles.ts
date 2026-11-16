import clsx from "clsx";

const screen = clsx("motion-screen flex flex-col pt-5");

const visuallyHidden = clsx("sr-only");

const period = clsx("mt-6 flex items-center justify-between gap-3");
const periodTitle = clsx("m-0 text-[1.75rem] leading-tight font-normal tracking-tight text-balance");
const arrows = clsx("flex shrink-0 gap-1");
const arrow = clsx("size-11 rounded-full text-2xl hover:bg-ground-sunken disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ink");

const weekSummary = clsx("mt-1 flex items-center justify-between gap-3");
const summaryText = clsx("flex flex-col gap-0.5");
const summaryLine = clsx("m-0 text-sm text-ink-soft");
const summaryCount = clsx("font-medium text-ink");
const sessions = clsx("m-0 text-[0.8125rem] text-muted");
const chart = clsx("mt-5");

const trainingList = clsx("motion-reveal m-0 mt-4 list-none p-0");
const trainingItemFirst = clsx("pt-7");
const trainingItem = clsx("pt-4");
const day = clsx("m-0 mb-2 text-[0.8125rem] font-medium text-muted");
const trainingLinkBase = clsx("flex min-h-11 items-center justify-between gap-3 no-underline focus-visible:outline-2 focus-visible:outline-ink");
const trainingLink = clsx(trainingLinkBase, "text-ink");
const trainingLinkEmpty = clsx(trainingLinkBase, "text-muted");
const trainingName = clsx("text-xl tracking-tight");
const chevron = clsx("text-lg text-muted");
const trainingNote = clsx("m-0 mb-2 text-sm whitespace-pre-wrap text-ink-soft");
const groupSummary = clsx("m-0 flex list-none flex-col gap-1.5 p-0");
const summaryRow = clsx("flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm");
const metric = clsx("text-muted");
const noEntries = clsx("m-0 text-sm text-muted");
const empty = clsx("my-8 text-sm text-muted");

const libraryHead = clsx("mt-6 flex items-center justify-between gap-3");
const libraryCount = clsx("m-0 text-sm text-muted");
const list = clsx("m-0 mt-3 flex list-none flex-col gap-1 p-0");
const row = clsx(
  "grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 no-underline",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);
const rowText = clsx("flex flex-col gap-1");
const name = clsx("text-[1.1875rem] tracking-tight text-ink");
const last = clsx("text-sm text-muted");

const archived = clsx("motion-disclosure mt-5 text-sm");
const archivedSummary = clsx(
  "flex min-h-11 cursor-pointer items-center text-muted hover:text-ink",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);
const archivedList = clsx("m-0 flex list-none flex-col p-0");
const archivedLink = clsx("flex min-h-11 items-center text-base text-ink-soft no-underline hover:text-ink");

const fab = clsx(
  "fixed right-[max(1.5rem,calc((100vw-28rem)/2+1.5rem))] bottom-[max(1.75rem,env(safe-area-inset-bottom))] z-10",
  "flex size-15 cursor-pointer items-center justify-center rounded-full bg-ink",
  "hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);
const fabIcon = clsx("size-[22px] fill-none stroke-ground [stroke-linecap:round] [stroke-width:1.8]");

export const exercisesScreenClasses = {
  screen,
  visuallyHidden,
  period,
  periodTitle,
  arrows,
  arrow,
  weekSummary,
  summaryText,
  summaryLine,
  summaryCount,
  sessions,
  chart,
  trainingList,
  trainingItemFirst,
  trainingItem,
  day,
  trainingLink,
  trainingLinkEmpty,
  trainingName,
  chevron,
  trainingNote,
  groupSummary,
  summaryRow,
  metric,
  noEntries,
  empty,
  libraryHead,
  libraryCount,
  list,
  row,
  rowText,
  name,
  last,
  archived,
  archivedSummary,
  archivedList,
  archivedLink,
  fab,
  fabIcon,
};
