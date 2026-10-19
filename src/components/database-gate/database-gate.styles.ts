import clsx from "clsx";

const screen = clsx("flex flex-col gap-4 pt-10");

const title = clsx("m-0 text-[2rem] leading-tight font-normal tracking-tight");

const body = clsx("m-0 text-base text-ink-soft");

const detail = clsx("m-0 border-t border-rule pt-4 font-mono text-xs break-words text-muted");

export const databaseGateClasses = {
  screen,
  title,
  body,
  detail,
};
