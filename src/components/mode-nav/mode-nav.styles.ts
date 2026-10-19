import clsx from "clsx";

const nav = clsx("flex gap-4 text-sm");

const linkBase = clsx(
  "flex min-h-11 items-center rounded-sm",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const link = clsx(linkBase, "text-muted hover:text-ink");

const linkActive = clsx(linkBase, "font-semibold text-ink");

export const modeNavClasses = {
  nav,
  link,
  linkActive,
};
