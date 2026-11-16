import clsx from "clsx";

const region = clsx(
  "pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4",
  "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
);

const toast = clsx(
  "motion-toast pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-2 text-ground",
);

const message = clsx("py-2 text-sm");

const action = clsx(
  "min-h-11 shrink-0 cursor-pointer rounded-full bg-ground/15 px-4 text-sm font-semibold hover:bg-ground/25",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ground",
);

export const toastClasses = {
  region,
  toast,
  message,
  action,
};
