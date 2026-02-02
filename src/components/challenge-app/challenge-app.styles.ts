import clsx from "clsx";

const container = clsx("min-h-screen flex flex-col");

const content = clsx(
  "mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-10",
  "sm:px-6 lg:px-10",
);

const mainGrid = clsx("mt-10 grid gap-6", "lg:grid-cols-[1.2fr_1fr]");

const statusSection = clsx("mt-10");

const footer = clsx("mt-auto flex items-center justify-center py-6");

const footerLink = clsx(
  "text-xs uppercase tracking-[0.2em] text-slate-400",
  "transition hover:text-emerald-200",
);

export const challengeAppClasses = {
  container,
  content,
  mainGrid,
  statusSection,
  footer,
  footerLink,
};
