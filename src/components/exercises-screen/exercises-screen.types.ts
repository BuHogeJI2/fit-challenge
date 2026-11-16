import type { TExercise, TSet } from "../../lib/db";
import type { TSavedEntry } from "../../lib/motion";

export interface IExerciseRowProps {
  exercise: TExercise;
  sets: TSet[];
  todayKey: string;
  returnTo: string;
  savedEntry?: TSavedEntry | null;
}
