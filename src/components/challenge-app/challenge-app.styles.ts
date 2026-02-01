import clsx from "clsx";

const container = clsx("min-h-screen");

const content = clsx(
  "mx-auto w-full max-w-6xl px-4 pb-16 pt-10",
  "sm:px-6 lg:px-10",
);

const mainGrid = clsx("mt-10 grid gap-6", "lg:grid-cols-[1.2fr_1fr]");

const statusSection = clsx("mt-10");

export const challengeAppClasses = {
  container,
  content,
  mainGrid,
  statusSection,
};
