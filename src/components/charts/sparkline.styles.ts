import clsx from "clsx";

export const sparklineClasses = {
  svg: clsx("block h-auto w-full"),
  line: clsx("fill-none stroke-ink [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.25]"),
  point: clsx("fill-ink"),
};
