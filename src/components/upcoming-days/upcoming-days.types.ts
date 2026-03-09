import type { TChallengeDayView } from "../../lib/challenge";

export interface IUpcomingDaysProps {
  days: TChallengeDayView[];
  onOpenDay: (dayId: number) => void;
}
