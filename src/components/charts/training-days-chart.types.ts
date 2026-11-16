import type { TTrainingDayCount } from "../../lib/stats";

export interface ITrainingDaysChartProps {
  days: TTrainingDayCount[];
  todayKey: string;
}
