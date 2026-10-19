import clsx from "clsx";

const frame = clsx("mx-auto flex min-h-screen w-full max-w-md flex-col");

const header = clsx("flex items-center justify-between px-6 pt-3");

const main = clsx("flex flex-1 flex-col px-6 pb-28");

export const appClasses = {
  frame,
  header,
  main,
};
