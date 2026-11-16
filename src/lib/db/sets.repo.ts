import { getDataGeneration } from "./data-generation";
import { db } from "./db";
import type { TExercise, TSet, TSetUndo, TTrainingTarget } from "./db.types";
import { assertDateKey, createId, normalizeNote, now } from "./record-fields";
import { RepositoryError } from "./repository-error";
import { isStoredFormFor, normalizeSetValues, type TSetValues } from "./set-values";
import { removeTrainingIfEmpty, takeTrainingForEntry } from "./training-links";

export type TSetInput = TSetValues & {
  exerciseId: string;
  date: string;
  note?: string | null;
  target?: TTrainingTarget;
};

export type TSetUpdate = TSetValues & {
  date: string;
  note?: string | null;
  target?: TTrainingTarget;
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

const insertSet = (input: TSetInput) => {
  assertDateKey(input.date);

  return db.transaction("rw", db.exercises, db.sets, db.trainings, async () => {
    const exercise = await getLoggableExercise(input.exerciseId);
    const values = normalizeSetValues(exercise.metric, input);
    const timestamp = now();
    const { training, created } = await takeTrainingForEntry(input.date, input.target, timestamp);

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
      trainingId: training.id,
      date: input.date,
      ...values,
      note: normalizeNote(input.note),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.sets.add(set);
    return { set, createdTraining: created ? training : null };
  });
};

/**
 * Adds a set to the target training. Without a target it goes to the
 * date's only training, or to a new one when the date has none.
 */
export const addSet = async (input: TSetInput) => (await insertSet(input)).set;

/**
 * Adds a set and returns what `undoAddSet` needs to remove it again while
 * nothing else changed it.
 */
export const addSetWithUndo = (input: TSetInput): Promise<TSetUndo> =>
  db.transaction("rw", db.exercises, db.sets, db.trainings, db.meta, async () => {
    const { set, createdTraining } = await insertSet(input);
    return { record: set, training: createdTraining, generation: await getDataGeneration() };
  });

/**
 * Removes a just-added set only if it is unchanged and no restore or wipe
 * happened since. A training created by that add goes too, if it is
 * unchanged and has no other entries. Returns whether it ran.
 */
export const undoAddSet = ({ record, training, generation }: TSetUndo) =>
  db.transaction("rw", db.sets, db.trainings, db.meta, async () => {
    const [currentGeneration, current] = await Promise.all([
      getDataGeneration(),
      db.sets.get(record.id),
    ]);

    const isUnchanged =
      current !== undefined &&
      (["exerciseId", "trainingId", "date", "reps", "weightKg", "seconds", "note"] as const).every(
        (field) => current[field] === record[field],
      );

    if (currentGeneration !== generation || !isUnchanged) {
      return false;
    }

    await db.sets.delete(record.id);

    if (training) {
      const currentTraining = await db.trainings.get(training.id);
      const isTrainingUnchanged =
        currentTraining !== undefined &&
        (["date", "name", "note"] as const).every((field) => currentTraining[field] === training[field]);
      const hasEntries = (await db.sets.where("trainingId").equals(training.id).count()) > 0;
      if (isTrainingUnchanged && !hasEntries) {
        await db.trainings.delete(training.id);
      }
    }
    return true;
  });

/**
 * Replaces a set's values, date and note. A target moves the set to that
 * training; a new date without a target picks the training as `addSet`
 * does. A training without a name or note that is left empty is removed.
 */
export const updateSet = async (id: string, update: TSetUpdate) => {
  assertDateKey(update.date);

  return db.transaction("rw", db.exercises, db.sets, db.trainings, async () => {
    const set = await db.sets.get(id);
    if (!set) {
      throw new RepositoryError("not_found", "This set no longer exists.");
    }

    const exercise = await getLoggableExercise(set.exerciseId);
    const values = normalizeSetValues(exercise.metric, update);
    const timestamp = now();
    const trainingId =
      update.target || update.date !== set.date
        ? (await takeTrainingForEntry(update.date, update.target, timestamp)).training.id
        : set.trainingId;

    const next: TSet = {
      ...set,
      trainingId,
      date: update.date,
      ...values,
      note: normalizeNote(update.note),
      updatedAt: timestamp,
    };

    await db.sets.put(next);
    if (trainingId !== set.trainingId) {
      await removeTrainingIfEmpty(set.trainingId);
    }
    return next;
  });
};

/**
 * Deletes a set. Its training goes with it when the set was the last entry
 * of a training without a name or note.
 */
export const deleteSet = (id: string): Promise<TSetUndo | null> =>
  db.transaction("rw", db.sets, db.trainings, db.meta, async () => {
    const record = await db.sets.get(id);
    if (!record) {
      return null;
    }

    await db.sets.delete(id);
    const training = await removeTrainingIfEmpty(record.trainingId);
    return { record, training, generation: await getDataGeneration() };
  });

/**
 * Puts a deleted set back, unchanged, only when its id is still free, its
 * exercise still exists with a matching metric, and no restore or wipe
 * happened since it was deleted. A training removed by that delete comes
 * back with it; a training removed later does not, and the set stays
 * deleted. Returns whether the set was restored.
 */
export const restoreSet = ({ record, training, generation }: TSetUndo) =>
  db.transaction("rw", db.exercises, db.sets, db.trainings, db.meta, async () => {
    const [currentGeneration, sameId, exercise, parent] = await Promise.all([
      getDataGeneration(),
      db.sets.get(record.id),
      db.exercises.get(record.exerciseId),
      db.trainings.get(record.trainingId),
    ]);

    const parentFits = training ? parent === undefined : parent?.date === record.date;

    if (
      currentGeneration !== generation ||
      sameId ||
      !exercise ||
      !isStoredFormFor(exercise.metric, record) ||
      !parentFits
    ) {
      return false;
    }

    if (training) {
      await db.trainings.add(training);
    }
    await db.sets.add(record);
    return true;
  });

export const listSetsForExercise = (exerciseId: string) =>
  db.sets.where("exerciseId").equals(exerciseId).toArray();

export const listSets = () => db.sets.toArray();

export const listSetsForTraining = (trainingId: string) =>
  db.sets.where("trainingId").equals(trainingId).toArray();
