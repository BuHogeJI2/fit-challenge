import type { TExercise } from "../../lib/db";

export interface IExerciseFormProps {
  exercise: TExercise | null;
  onSaved: (exercise: TExercise) => void;
  onArchiveToggle: (exercise: TExercise) => Promise<void>;
}

export interface IExerciseFormSheetProps extends IExerciseFormProps {
  open: boolean;
  onClose: () => void;
}
