import type { TExercise, TSet, TSetValues, TTraining, TTrainingTarget } from "../../lib/db";

export type TReadResult = { ok: true; values: TSetValues } | { ok: false; error: string };

export type TSetSheetState =
  | { mode: "new"; exerciseId?: string; trainingId?: string; date?: string; values?: TSetValues }
  | { mode: "edit"; set: TSet }
  | null;

export interface ISetEntryFormProps {
  exercise: TExercise;
  set: TSet | null;
  sets: TSet[];
  todayKey: string;
  date: string;
  onDateChange: (date: string) => void;
  trainings: TTraining[];
  exercises: TExercise[];
  target?: TTrainingTarget;
  onTargetChange: (target: TTrainingTarget) => void;
  fixedTraining: boolean;
  values?: TSetValues;
  onSaved: (set: TSet) => void;
  onDelete?: (set: TSet) => Promise<void>;
}

export interface ISetEntryBodyProps extends Omit<ISetEntrySheetProps, "onClose"> {
  trainings: TTraining[];
  onExerciseChange: (exerciseId: string) => void;
  exercise?: TExercise;
  recentExercises: TExercise[];
}

export interface ISetEntrySheetProps {
  state: TSetSheetState;
  exercises: TExercise[];
  sets: TSet[];
  todayKey: string;
  onClose: () => void;
  onSaved: (set: TSet) => void;
  onDelete?: (set: TSet) => Promise<void>;
}
