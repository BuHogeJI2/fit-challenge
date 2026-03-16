import type {
  TChallengeDayView,
  TRunPhase,
  TToggleDayDoneOptions,
} from "../../lib/challenge";

export interface IFeaturedDayCardProps {
  day: TChallengeDayView;
  runPhase: TRunPhase;
  onOpenDay: (dayId: number) => void;
  onOpenExerciseTracker: (exerciseId: number) => void;
  onToggleDayDone: (dayNumber: number, options: TToggleDayDoneOptions) => void;
}
