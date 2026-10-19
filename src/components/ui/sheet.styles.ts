import clsx from "clsx";

const dialog = clsx(
  "m-0 mt-auto max-h-[92vh] w-full max-w-none bg-transparent p-0 text-ink",
  "sm:mx-auto sm:max-w-md",
  "backdrop:bg-ink/45",
);

const panel = clsx(
  "flex flex-col gap-5 rounded-t-3xl bg-ground px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))]",
);

const handle = clsx("h-1 w-9 self-center rounded-full bg-rule-strong");

const header = clsx("flex items-center justify-between gap-4");

const title = clsx("text-lg font-medium");

const close = clsx(
  "min-h-11 cursor-pointer rounded-sm text-sm text-muted hover:text-ink",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

export const sheetClasses = {
  dialog,
  panel,
  handle,
  header,
  title,
  close,
};
