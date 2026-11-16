import clsx from "clsx";

const screen = clsx("flex flex-col pt-6");

const title = clsx("m-0 text-[2.75rem] leading-tight font-normal tracking-tight");

const viewSwitch = clsx("mt-1 flex gap-4 text-sm");

const viewBase = clsx(
  "min-h-11 cursor-pointer rounded-sm",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const view = clsx(viewBase, "text-muted hover:text-ink");

const viewActive = clsx(viewBase, "font-semibold text-ink underline underline-offset-6");

const subline = clsx("m-0 text-sm text-muted");

const stats = clsx("m-0 grid grid-cols-3 gap-4 border-b border-rule pb-4");
const overallLabel = clsx("m-0 mb-2 text-xs font-medium text-muted");
const periodStats = clsx("m-0 mt-4 grid grid-cols-3 gap-3 border-t border-rule pt-4");
const stat = clsx("flex flex-col gap-1");

const statLabel = clsx("text-xs text-muted");

const statValue = clsx("m-0 flex flex-col text-base font-medium");

const statNote = clsx("text-xs font-normal text-muted");

const firstUse = clsx("mt-8 flex flex-col gap-6 border-t border-ink pt-6");

const fab = clsx(
  "fixed right-[max(1.5rem,calc((100vw-28rem)/2+1.5rem))] bottom-[max(1.75rem,env(safe-area-inset-bottom))] z-10",
  "flex size-15 cursor-pointer items-center justify-center rounded-full bg-ink",
  "hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const fabIcon = clsx("size-[22px] fill-none stroke-ground [stroke-linecap:round] [stroke-width:1.8]");

export const weightScreenClasses = {
  screen,
  title,
  viewSwitch,
  view,
  viewActive,
  subline,
  stats,
  overallLabel,
  periodStats,
  stat,
  statLabel,
  statValue,
  statNote,
  firstUse,
  fab,
  fabIcon,
};
