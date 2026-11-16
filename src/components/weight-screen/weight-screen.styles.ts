import clsx from "clsx";

const screen = clsx("motion-screen flex flex-col pt-6");

const title = clsx("m-0 text-[1.75rem] leading-tight font-normal tracking-tight text-balance");

const viewSwitch = clsx("mt-1");

const subline = clsx("m-0 text-sm text-muted");

const stats = clsx("m-0 grid grid-cols-3 gap-4 pb-5");
const overallLabel = clsx("m-0 mb-2 text-xs font-medium text-muted");
const periodStats = clsx("m-0 mt-5 grid grid-cols-3 gap-3");
const stat = clsx("flex flex-col gap-1");

const statLabel = clsx("text-xs text-muted");

const statValue = clsx("m-0 flex flex-col text-base font-medium");

const statNote = clsx("text-xs font-normal text-muted");

const firstUse = clsx("mt-8 flex flex-col gap-6");

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
