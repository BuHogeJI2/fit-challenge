import clsx from "clsx";
import { useSelectionIndicator } from "../../lib/motion";
import { segmentedControlClasses as classes } from "./segmented-control.styles";
import type { ISegmentedControlProps } from "./segmented-control.types";

export function SegmentedControl<T extends string>({ label, options, value, onChange, className }: ISegmentedControlProps<T>) {
  const ref = useSelectionIndicator<HTMLDivElement>(value);
  return (
    <div ref={ref} role="group" aria-label={label} className={clsx(classes.group, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          className={option.value === value ? classes.optionActive : classes.option}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
