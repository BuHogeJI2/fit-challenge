import { daySummaryTooltipClasses } from "./day-summary-tooltip.styles";
import type { IDaySummaryTooltipProps } from "./day-summary-tooltip.types";

export function DaySummaryTooltip({
  dateLabel,
  exercisesLabel,
  state,
}: IDaySummaryTooltipProps) {
  return (
    <div
      className={`${daySummaryTooltipClasses.tooltip} ${
        state === "closing"
          ? daySummaryTooltipClasses.closing
          : daySummaryTooltipClasses.open
      }`}
    >
      <div className={daySummaryTooltipClasses.date}>{dateLabel}</div>
      <div className={daySummaryTooltipClasses.exercises}>{exercisesLabel}</div>
    </div>
  );
}
