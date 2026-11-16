import clsx from "clsx";

export const trainingDetailClasses = {
  screen: clsx("motion-screen flex flex-col pt-2"),
  header: clsx("flex items-center justify-between gap-3"),
  back: clsx("flex min-h-11 items-center text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"),
  title: clsx("m-0 mt-2 text-[2.75rem] leading-tight font-normal tracking-tight"),
  meta: clsx("m-0 mt-2 text-sm text-muted"),
  note: clsx("m-0 mt-3 whitespace-pre-wrap text-base text-ink-soft"),
  groups: clsx("m-0 mt-6 list-none border-t border-ink p-0"),
  group: clsx("border-b border-rule py-4"),
  name: clsx("m-0 text-xl font-normal"),
  exercise: clsx("flex min-h-11 items-center justify-between gap-3 no-underline hover:underline focus-visible:outline-2 focus-visible:outline-ink"),
  entries: clsx("m-0 mt-2 flex list-none flex-col gap-2 p-0"),
  entry: clsx("flex min-h-11 w-full items-center justify-between gap-3 rounded-sm px-2 text-left hover:bg-ground-sunken focus-visible:outline-2 focus-visible:outline-ink"),
  values: clsx("shrink-0 text-sm font-medium"),
  entryNote: clsx("text-sm whitespace-pre-wrap text-ink-soft"),
  actions: clsx("sticky bottom-0 -mx-6 mt-6 bg-ground px-6 py-4"),
  empty: clsx("my-8 text-sm text-muted"),
};
