import clsx from "clsx";

const frame = clsx("mx-auto flex min-h-screen w-full max-w-md flex-col");

const header = clsx("flex items-center justify-between px-6 pt-3");

const main = clsx("flex flex-1 flex-col px-6 pb-28");

const screen = clsx("flex flex-col pt-6");

const title = clsx("text-[2.75rem] leading-tight font-normal tracking-tight");

export const appClasses = {
  frame,
  header,
  main,
  screen,
  title,
};
