export type TTooltipState = "open" | "closing";

export interface IDaySummaryTooltipProps {
  dateLabel: string;
  exercisesLabel: string;
  state: TTooltipState;
}
