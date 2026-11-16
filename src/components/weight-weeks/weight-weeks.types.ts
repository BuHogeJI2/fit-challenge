import type { TWeekWeight } from "../../lib/stats";

export interface IWeightWeeksProps {
  weeks: TWeekWeight[];
  todayKey: string;
  getWeekHref: (weekStart: string) => string;
  onOpen: () => void;
}
