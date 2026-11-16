import type { TExercise, TSet, TTraining } from "../db";

/** Returns the explicit training name, its session exercise names, or a fallback. */
export const getTrainingTitle = (
  training: TTraining,
  sets: readonly TSet[],
  exercises: readonly TExercise[],
): string => {
  if (training.name) return training.name;
  const sessionIds = new Set(
    sets.filter((set) => set.trainingId === training.id).map((set) => set.exerciseId),
  );
  const names = exercises
    .filter((exercise) => exercise.metric === "session" && sessionIds.has(exercise.id))
    .map((exercise) => exercise.name);
  return names.length ? names.join(" + ") : "Training";
};
