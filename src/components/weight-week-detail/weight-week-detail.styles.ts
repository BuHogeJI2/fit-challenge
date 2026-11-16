import clsx from "clsx";

export const weightWeekClasses = {
  screen: clsx("motion-screen flex flex-col pt-2"),
  back: clsx("flex min-h-11 items-center text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"),
  summary: clsx("m-0 mt-4 grid grid-cols-3 gap-3 border-t border-rule pt-4 text-sm"),
  label: clsx("text-xs text-muted"),
  value: clsx("m-0 mt-1 font-medium"),
  date: clsx("block text-xs font-normal text-muted"),
};
