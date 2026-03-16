import type {
  TChallengeDayExerciseView,
  TChallengeDayView,
} from "../../lib/challenge";

export interface IExerciseTrackerSheetProps {
  open: boolean;
  day: TChallengeDayView | null;
  exercise: TChallengeDayExerciseView | null;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exerciseId: number) => void;
  onAddExerciseSet: (dayNumber: number, exerciseId: number, reps: number) => void;
  onRemoveExerciseSet: (
    dayNumber: number,
    exerciseId: number,
    setId: string,
  ) => void;
}
