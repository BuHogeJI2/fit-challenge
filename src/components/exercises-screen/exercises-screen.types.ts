import type { TExercise, TSet } from "../../lib/db";

export interface IExerciseRowProps {
  exercise: TExercise;
  sets: TSet[];
  todayKey: string;
}
