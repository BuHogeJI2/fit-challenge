import type {
  TChallengeDayView,
  TToggleDayDoneOptions,
} from "../../lib/challenge";

export interface IDayDetailsSheetProps {
  open: boolean;
  day: TChallengeDayView | null;
  onOpenChange: (open: boolean) => void;
  onToggleDayDone: (dayNumber: number, options: TToggleDayDoneOptions) => void;
  onAddExerciseSet: (dayNumber: number, exerciseId: number, reps: number) => void;
  onRemoveExerciseSet: (
    dayNumber: number,
    exerciseId: number,
    setId: string,
  ) => void;
}
