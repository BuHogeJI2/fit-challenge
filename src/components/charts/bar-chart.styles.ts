import clsx from "clsx";

const figure = clsx(
  "m-0 rounded-sm",
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
);

const svg = clsx("block h-auto w-full overflow-visible");

const bar = clsx("fill-muted");

const barSelected = clsx("fill-ink");

const hitArea = clsx("cursor-pointer fill-transparent");

export const barChartClasses = {
  figure,
  svg,
  bar,
  barSelected,
  hitArea,
};
