import clsx from "clsx";

const container = clsx("min-h-screen");

const content = clsx(
  "mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-6",
  "sm:px-6 sm:pt-8 lg:px-8 lg:pt-10",
);

export const challengeAppClasses = {
  container,
  content,
};
