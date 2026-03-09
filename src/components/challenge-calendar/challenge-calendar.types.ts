import type { TCalendarMonth } from "../../lib/challenge";

export interface IChallengeCalendarProps {
  months: TCalendarMonth[];
  onOpenDay: (dayId: number) => void;
}
