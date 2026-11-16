import clsx from "clsx";

const nav = clsx("flex gap-5 text-[0.9375rem]");

const linkBase = clsx(
  "motion-press flex min-h-11 items-center rounded-sm transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const link = clsx(linkBase, "text-muted hover:text-ink");

const linkActive = clsx(linkBase, "font-semibold text-ink");

export const modeNavClasses = {
  nav,
  link,
  linkActive,
};
