import clsx from "clsx";

export const weightWeekClasses = {
  screen: clsx("motion-screen flex flex-col pt-2"),
  back: clsx("flex min-h-11 self-start items-center gap-1 rounded-sm text-sm text-muted no-underline hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"),
  backIcon: clsx("text-lg"),
  summary: clsx("m-0 mt-5 grid grid-cols-3 gap-3 text-sm"),
  label: clsx("text-xs text-muted"),
  value: clsx("m-0 mt-1 font-medium"),
  date: clsx("block text-xs font-normal text-muted"),
};
