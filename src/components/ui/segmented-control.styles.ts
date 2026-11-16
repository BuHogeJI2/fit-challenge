import clsx from "clsx";

const group = clsx(
  "relative grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-ground-sunken p-1",
  "before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:rounded-full",
  "before:bg-ground-raised before:shadow-[0_1px_2px_rgb(34_34_34/0.12)]",
  "before:w-[var(--selection-width,0px)] before:translate-x-[var(--selection-x,0px)]",
  "before:transition-[width,translate] before:duration-[var(--motion-normal)] before:ease-[var(--motion-ease)]",
  "motion-reduce:before:transition-none",
);

const optionBase = clsx(
  "relative min-h-11 cursor-pointer rounded-full px-3 text-sm transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const option = clsx(optionBase, "text-muted hover:text-ink");

const optionActive = clsx(optionBase, "font-semibold text-ink");

export const segmentedControlClasses = {
  group,
  option,
  optionActive,
};
