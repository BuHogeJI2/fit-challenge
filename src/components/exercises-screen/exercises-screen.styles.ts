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
};
