import clsx from "clsx";

export const selectionIndicatorClass = clsx(
  "relative after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:bg-ink",
  "after:w-[var(--selection-width,0px)] after:translate-x-[var(--selection-x,0px)]",
  "after:transition-[width,translate] after:duration-[var(--motion-normal)] after:ease-[var(--motion-ease)]",
  "motion-reduce:after:transition-none",
);
