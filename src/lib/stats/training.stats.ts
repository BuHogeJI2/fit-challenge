import type { TExercise, TSet, TTraining } from "../db";
import { formatDuration, formatLoadValue, formatReps } from "../numbers";

export type TTrainingExercise = {
  exerciseId: string;
  exercise: TExercise | null;
  sets: TSet[];
  summary: string;
};

/** Groups training entries by exercise and describes each metric separately. */
export const getTrainingExercises = (
  sets: readonly TSet[],
  exercises: readonly TExercise[],
): TTrainingExercise[] => {
  const grouped = new Map<string, TSet[]>();
  for (const set of [...sets].sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))) {
    const group = grouped.get(set.exerciseId) ?? [];
    group.push(set);
    grouped.set(set.exerciseId, group);
  }
  return [...grouped].map(([exerciseId, entries]) => {
    const exercise = exercises.find((item) => item.id === exerciseId) ?? null;
    let summary = `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`;
    if (exercise?.metric === "session") {
      summary = `${entries.length} session${entries.length === 1 ? "" : "s"}`;
    } else if (exercise?.metric === "time") {
      summary = `${entries.length} set${entries.length === 1 ? "" : "s"} · ${formatDuration(entries.reduce((total, set) => total + (set.seconds ?? 0), 0))}`;
    } else if (exercise?.metric === "reps") {
      summary = `${entries.length} set${entries.length === 1 ? "" : "s"} · ${formatReps(entries.reduce((total, set) => total + (set.reps ?? 0), 0))}`;
    } else if (exercise?.metric === "reps_weight") {
      const loads = new Map<number, number>();
      for (const set of entries) {
        if (set.weightKg !== null) loads.set(set.weightKg, (loads.get(set.weightKg) ?? 0) + (set.reps ?? 0));
      }
      summary = [...loads].sort(([left], [right]) => left - right)
        .map(([load, reps]) => `${formatReps(reps)} at ${formatLoadValue(load)} kg`).join(" · ");
    }
    return { exerciseId, exercise, sets: entries, summary };
  }).sort((left, right) => (left.exercise?.name ?? "Unknown exercise").localeCompare(right.exercise?.name ?? "Unknown exercise"));
};

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
