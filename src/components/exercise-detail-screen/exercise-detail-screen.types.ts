import type { TExercise, TSet } from "../../lib/db";

export interface IExerciseDetailScreenProps {
  exerciseId: string;
}

export interface ISetChipProps {
  exercise: TExercise;
  set: TSet;
  isBest: boolean;
  onEdit: (set: TSet) => void;
}
