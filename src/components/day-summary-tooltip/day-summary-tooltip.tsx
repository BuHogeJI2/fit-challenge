import { daySummaryTooltipClasses } from "./day-summary-tooltip.styles";
import type { IDaySummaryTooltipProps } from "./day-summary-tooltip.types";

export function DaySummaryTooltip({
  dateLabel,
  exercisesLabel,
  onMouseLeave,
  onMouseEnter,
}: IDaySummaryTooltipProps) {
  return (
    <div
      className={daySummaryTooltipClasses.tooltip}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={daySummaryTooltipClasses.date}>{dateLabel}</div>
      <div className={daySummaryTooltipClasses.exercises}>{exercisesLabel}</div>
    </div>
  );
}
