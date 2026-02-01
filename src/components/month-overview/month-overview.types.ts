import type { TCalendarDay } from "../../lib/challenge";

export interface IMonthOverviewProps {
  monthLabel: string;
  startOffset: number;
  calendarDays: TCalendarDay[];
}
