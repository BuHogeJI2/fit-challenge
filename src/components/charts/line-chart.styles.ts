import clsx from "clsx";

const figure = clsx(
  "m-0 rounded-sm",
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
);

const svg = clsx("block h-auto w-full overflow-visible");

const goalLine = clsx("stroke-ink [stroke-dasharray:4_4] [stroke-width:1]");

const goalText = clsx("fill-ink text-[11px]");

const line = clsx("fill-none stroke-ink [stroke-linejoin:round] [stroke-width:1.25]");

const point = clsx("fill-ground stroke-ink [stroke-width:1.5]");

const pointSelected = clsx("fill-ink stroke-ink [stroke-width:1.5]");

const hitArea = clsx("cursor-pointer fill-transparent");

export const lineChartClasses = {
  figure,
  svg,
  goalLine,
  goalText,
  line,
  point,
  pointSelected,
  hitArea,
};
