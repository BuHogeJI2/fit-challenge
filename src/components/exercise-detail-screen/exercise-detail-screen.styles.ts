import clsx from "clsx";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const screen = clsx("flex flex-col pt-2");

const topRow = clsx("-ml-2 flex items-center justify-between");

const backLink = clsx(
  "flex min-h-11 items-center gap-1 rounded-sm px-2 text-sm text-ink no-underline hover:text-black",
  focus,
);

const backIcon = clsx("size-4 fill-none stroke-ink [stroke-width:1.4]");

const title = clsx("m-0 mt-2 text-[2.75rem] leading-tight font-normal tracking-tight");

const subline = clsx("m-0 mt-1 text-sm text-muted");

const sentence = clsx("m-0 mt-1 text-sm text-ink-soft");

const notice = clsx("mt-5 flex items-center justify-between gap-4 border-y border-rule py-3");

const noticeText = clsx("m-0 text-sm text-ink-soft");

const loads = clsx("mt-5 flex flex-wrap gap-2");

const loadBase = clsx("min-h-11 cursor-pointer rounded-full px-4 text-sm", focus);

const load = clsx(loadBase, "border border-rule-strong hover:border-ink");

const loadActive = clsx(loadBase, "border border-ink bg-ink text-ground");

const chart = clsx("mt-6 flex flex-col gap-2");

const readout = clsx("m-0 min-h-5 text-sm font-medium");

const empty = clsx("my-10 text-center text-sm text-muted");

const days = clsx("m-0 mt-4 flex list-none flex-col border-t border-ink p-0");

const day = clsx("flex flex-col gap-2.5 border-b border-rule py-4");

const dayHead = clsx("flex items-baseline justify-between gap-4");

const dayTitle = clsx("m-0 text-lg font-normal");

const daySummary = clsx("text-sm text-muted");

const chips = clsx("flex flex-wrap gap-2");

const chipBase = clsx("min-h-11 min-w-13 cursor-pointer rounded-full px-3 text-[0.9375rem]", focus);

const chip = clsx(chipBase, "border border-rule-strong hover:border-ink");

const chipBest = clsx(chipBase, "border-[1.5px] border-ink font-semibold");

const repeatChip = clsx(
  chipBase,
  "flex items-center justify-center border border-dashed border-rule-strong hover:border-ink",
);

const repeatIcon = clsx("size-4 fill-none stroke-ink [stroke-linecap:round] [stroke-width:1.4]");

const actions = clsx(
  "sticky bottom-0 -mx-6 mt-6 grid grid-cols-2 gap-3 bg-ground px-6 pt-3",
  "pb-[max(1.75rem,env(safe-area-inset-bottom))]",
);

export const exerciseDetailScreenClasses = {
  screen,
  topRow,
  backLink,
  backIcon,
  title,
  subline,
  sentence,
  notice,
  noticeText,
  loads,
  load,
  loadActive,
  chart,
  readout,
  empty,
  days,
  day,
  dayHead,
  dayTitle,
  daySummary,
  chips,
  chip,
  chipBest,
  repeatChip,
  repeatIcon,
  actions,
};
