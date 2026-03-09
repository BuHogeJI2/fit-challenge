import type { TChallengeDayView, TRunPhase } from "../../lib/challenge";

export interface IFeaturedDayCardProps {
  day: TChallengeDayView;
  runPhase: TRunPhase;
  onOpenDay: (dayId: number) => void;
  onToggleDayDone: (dayNumber: number) => void;
}
