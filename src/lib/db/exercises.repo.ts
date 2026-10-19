import { db } from "./db";
import type { TExercise, TMetric } from "./db.types";
import { createId, normalizeLoadKg, now } from "./record-fields";
import { RepositoryError } from "./repository-error";

export const METRICS: readonly TMetric[] = ["reps", "reps_weight", "time"];

export const EXERCISE_NAME_MAX_LENGTH = 60;

export type TExerciseInput = {
  name: string;
  metric: TMetric;
};

export type TExerciseUpdate = Partial<TExerciseInput> & {
  progressWeightKg?: number | null;
};

const normalizeName = (name: string) => {
  const trimmed = name.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    throw new RepositoryError("invalid_input", "Name is required.");
  }

  if (trimmed.length > EXERCISE_NAME_MAX_LENGTH) {
    throw new RepositoryError(
      "invalid_input",
      `Name must be ${EXERCISE_NAME_MAX_LENGTH} characters or fewer.`,
    );
  }

  return trimmed;
};

const assertMetric = (metric: TMetric) => {
  if (!METRICS.includes(metric)) {
    throw new RepositoryError("invalid_input", `Unknown metric: ${metric}`);
  }
};

const getExistingExercise = async (id: string) => {
  const exercise = await db.exercises.get(id);
  if (!exercise) {
    throw new RepositoryError("not_found", "This exercise no longer exists.");
  }
  return exercise;
};

export const createExercise = async (input: TExerciseInput) => {
  assertMetric(input.metric);

  const timestamp = now();
  const exercise: TExercise = {
    id: createId(),
    name: normalizeName(input.name),
    metric: input.metric,
    metricLockedAt: null,
    progressWeightKg: null,
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db.exercises.add(exercise);
  return exercise;
};

export const updateExercise = (id: string, update: TExerciseUpdate) =>
  db.transaction("rw", db.exercises, async () => {
    const exercise = await getExistingExercise(id);
    const metric = update.metric ?? exercise.metric;

    assertMetric(metric);

    if (metric !== exercise.metric && exercise.metricLockedAt) {
      throw new RepositoryError(
        "metric_locked",
        "The metric cannot change after the first logged set.",
      );
    }

    let progressWeightKg =
      update.progressWeightKg === undefined
        ? exercise.progressWeightKg
        : update.progressWeightKg;

    if (metric !== "reps_weight") {
      progressWeightKg = null;
    } else if (progressWeightKg !== null) {
      progressWeightKg = normalizeLoadKg(progressWeightKg);
    }

    const next: TExercise = {
      ...exercise,
      name: update.name === undefined ? exercise.name : normalizeName(update.name),
      metric,
      progressWeightKg,
      updatedAt: now(),
    };

    await db.exercises.put(next);
    return next;
  });

const setArchivedAt = (id: string, archivedAt: string | null) =>
  db.transaction("rw", db.exercises, async () => {
    const exercise = await getExistingExercise(id);
    const next: TExercise = { ...exercise, archivedAt, updatedAt: now() };

    await db.exercises.put(next);
    return next;
  });

export const archiveExercise = (id: string) => setArchivedAt(id, now());

export const unarchiveExercise = (id: string) => setArchivedAt(id, null);

export const getExercise = (id: string) => db.exercises.get(id);

export const listExercises = () => db.exercises.toArray();
