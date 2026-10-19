import clsx from "clsx";

const frame = clsx("mx-auto flex min-h-screen w-full max-w-md flex-col");

const header = clsx("flex items-center justify-between px-6 pt-3");

const main = clsx("flex flex-1 flex-col px-6 pb-28");

const settingsBase = clsx(
  "flex min-h-11 items-center rounded-sm text-sm",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const settings = clsx(settingsBase, "text-muted hover:text-ink");

const settingsActive = clsx(settingsBase, "font-semibold text-ink");

export const appClasses = {
  frame,
  header,
  main,
  settings,
  settingsActive,
};
