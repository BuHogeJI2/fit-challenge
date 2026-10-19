import { getDataGeneration } from "./data-generation";
import { db } from "./db";
import type { TExercise, TMetric, TPendingUndo, TSet } from "./db.types";
import {
  assertDateKey,
  assertPositiveInteger,
  createId,
  normalizeLoadKg,
  normalizeNote,
  now,
} from "./record-fields";
import { RepositoryError } from "./repository-error";

export type TSetValues = {
  reps: number | null;
  weightKg: number | null;
  seconds: number | null;
};

export type TSetInput = TSetValues & {
  exerciseId: string;
  date: string;
  note?: string | null;
};

export type TSetUpdate = TSetValues & {
  date: string;
  note?: string | null;
};

const assertNull = (value: number | null, label: string, metric: TMetric) => {
  if (value !== null) {
    throw new RepositoryError("invalid_input", `${label} is not used by ${metric}.`);
  }
};

const requireInteger = (value: number | null, label: string): number => {
  if (value === null) {
    throw new RepositoryError("invalid_input", `${label} is required.`);
  }
  assertPositiveInteger(value, label);
  return value;
};

/**
 * Returns the stored form of set values for a metric, or throws a
 * `RepositoryError` when they do not fit it: `reps` needs reps only,
 * `reps_weight` needs reps and weight (kept to 0.01 kg), `time` needs
 * seconds only.
 */
export const normalizeSetValues = (metric: TMetric, values: TSetValues): TSetValues => {
  switch (metric) {
    case "reps":
      assertNull(values.weightKg, "Weight", metric);
      assertNull(values.seconds, "Time", metric);
      return { reps: requireInteger(values.reps, "Reps"), weightKg: null, seconds: null };
    case "reps_weight":
      assertNull(values.seconds, "Time", metric);
      if (values.weightKg === null) {
        throw new RepositoryError("invalid_input", "Weight is required.");
      }
      return {
        reps: requireInteger(values.reps, "Reps"),
        weightKg: normalizeLoadKg(values.weightKg),
        seconds: null,
      };
    case "time":
      assertNull(values.reps, "Reps", metric);
      assertNull(values.weightKg, "Weight", metric);
      return { reps: null, weightKg: null, seconds: requireInteger(values.seconds, "Time") };
  }
};

const isStoredFormFor = (metric: TMetric, set: TSet) => {
  try {
    const normalized = normalizeSetValues(metric, set);
    return (
      normalized.reps === set.reps &&
      normalized.weightKg === set.weightKg &&
      normalized.seconds === set.seconds
    );
  } catch {
    return false;
  }
};

const getLoggableExercise = async (id: string): Promise<TExercise> => {
  const exercise = await db.exercises.get(id);

  if (!exercise) {
    throw new RepositoryError("not_found", "This exercise no longer exists.");
  }

  if (exercise.archivedAt) {
    throw new RepositoryError("archived", "Restore the exercise before logging sets.");
  }

  return exercise;
};

export const addSet = async (input: TSetInput) => {
  assertDateKey(input.date);

  return db.transaction("rw", db.exercises, db.sets, async () => {
    const exercise = await getLoggableExercise(input.exerciseId);
    const values = normalizeSetValues(exercise.metric, input);
    const timestamp = now();

    if (!exercise.metricLockedAt) {
      await db.exercises.put({
        ...exercise,
        metricLockedAt: timestamp,
        updatedAt: timestamp,
      });
    }

    const set: TSet = {
      id: createId(),
      exerciseId: exercise.id,
      date: input.date,
      ...values,
      note: normalizeNote(input.note),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.sets.add(set);
    return set;
  });
};

export const updateSet = async (id: string, update: TSetUpdate) => {
  assertDateKey(update.date);

  return db.transaction("rw", db.exercises, db.sets, async () => {
    const set = await db.sets.get(id);
    if (!set) {
      throw new RepositoryError("not_found", "This set no longer exists.");
    }

    const exercise = await getLoggableExercise(set.exerciseId);
    const next: TSet = {
      ...set,
      date: update.date,
      ...normalizeSetValues(exercise.metric, update),
      note: normalizeNote(update.note),
      updatedAt: now(),
    };

    await db.sets.put(next);
    return next;
  });
};

export const deleteSet = (id: string): Promise<TPendingUndo<TSet> | null> =>
  db.transaction("rw", db.sets, db.meta, async () => {
    const record = await db.sets.get(id);
    if (!record) {
      return null;
    }

    await db.sets.delete(id);
    return { record, generation: await getDataGeneration() };
  });

/**
 * Puts a deleted set back, unchanged, only when its id is still free, its
 * exercise still exists with a matching metric, and no restore or wipe
 * happened since it was deleted. Returns whether the set was restored.
 */
export const restoreSet = ({ record, generation }: TPendingUndo<TSet>) =>
  db.transaction("rw", db.exercises, db.sets, db.meta, async () => {
    const [currentGeneration, sameId, exercise] = await Promise.all([
      getDataGeneration(),
      db.sets.get(record.id),
      db.exercises.get(record.exerciseId),
    ]);

    if (
      currentGeneration !== generation ||
      sameId ||
      !exercise ||
      !isStoredFormFor(exercise.metric, record)
    ) {
      return false;
    }

    await db.sets.add(record);
    return true;
  });

export const listSetsForExercise = (exerciseId: string) =>
  db.sets.where("exerciseId").equals(exerciseId).toArray();

export const listSets = () => db.sets.toArray();
