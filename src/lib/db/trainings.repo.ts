import { getDataGeneration } from "./data-generation";
import { db } from "./db";
import type { TTraining, TTrainingTarget, TTrainingUndo } from "./db.types";
import { assertDateKey, createId, normalizeNote, now } from "./record-fields";
import { RepositoryError } from "./repository-error";
import { isStoredFormFor } from "./set-values";

export const TRAINING_NAME_MAX_LENGTH = 60;

export type TTrainingInput = {
  date: string;
  name?: string | null;
  note?: string | null;
};

export type TTrainingUpdate = {
  date: string;
  name: string | null;
  note: string | null;
};

const normalizeTrainingName = (name: string | null | undefined) => {
  const trimmed = name?.trim().replace(/\s+/g, " ") ?? "";
  if (trimmed.length > TRAINING_NAME_MAX_LENGTH) {
    throw new RepositoryError(
      "invalid_input",
      `Name must be ${TRAINING_NAME_MAX_LENGTH} characters or fewer.`,
    );
  }
  return trimmed ? trimmed : null;
};

const byCreation = (left: TTraining, right: TTraining) =>
  left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id);

/**
 * Picks the training for an entry on a date when the caller did not choose
 * one: a new training when the date has none, the only one when there is
 * one. Throws `training_choice_required` when there are several. An
 * explicit target is returned unchanged.
 */
export const resolveTrainingTarget = (
  trainingsOnDate: readonly TTraining[],
  target?: TTrainingTarget,
): TTrainingTarget => {
  if (target) return target;
  if (trainingsOnDate.length === 0) return { newTraining: true };
  if (trainingsOnDate.length === 1) return { trainingId: trainingsOnDate[0].id };
  throw new RepositoryError("training_choice_required", "Choose the training for this entry.");
};

export const listTrainings = () => db.trainings.toArray();

/** Returns the trainings on a date, oldest first. */
export const listTrainingsOnDate = async (date: string) =>
  (await db.trainings.where("date").equals(date).toArray()).sort(byCreation);

export const getTraining = (id: string) => db.trainings.get(id);

export const createTraining = async (input: TTrainingInput) => {
  assertDateKey(input.date);
  const timestamp = now();
  const training: TTraining = {
    id: createId(),
    date: input.date,
    name: normalizeTrainingName(input.name),
    note: normalizeNote(input.note),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await db.trainings.add(training);
  return training;
};

/**
 * Replaces a training's date, name and note. A new date moves every entry
 * of the training with it. Moving is refused while an entry belongs to an
 * archived exercise, as editing that entry would be.
 */
export const updateTraining = async (id: string, update: TTrainingUpdate) => {
  assertDateKey(update.date);
  const name = normalizeTrainingName(update.name);
  const note = normalizeNote(update.note);

  return db.transaction("rw", db.exercises, db.sets, db.trainings, async () => {
    const training = await db.trainings.get(id);
    if (!training) {
      throw new RepositoryError("not_found", "This training no longer exists.");
    }

    const timestamp = now();
    if (update.date !== training.date) {
      const sets = await db.sets.where("trainingId").equals(id).toArray();
      const exercises = await db.exercises.bulkGet([...new Set(sets.map((set) => set.exerciseId))]);
      if (exercises.some((exercise) => exercise?.archivedAt)) {
        throw new RepositoryError(
          "archived",
          "Restore the archived exercise before moving this training.",
        );
      }
      await db.sets.bulkPut(sets.map((set) => ({ ...set, date: update.date, updatedAt: timestamp })));
    }

    const next: TTraining = { ...training, date: update.date, name, note, updatedAt: timestamp };
    await db.trainings.put(next);
    return next;
  });
};

/** Deletes a training with all of its entries and returns what undo needs. */
export const deleteTraining = (id: string): Promise<TTrainingUndo | null> =>
  db.transaction("rw", db.sets, db.trainings, db.meta, async () => {
    const training = await db.trainings.get(id);
    if (!training) {
      return null;
    }

    const sets = await db.sets.where("trainingId").equals(id).toArray();
    await db.sets.bulkDelete(sets.map((set) => set.id));
    await db.trainings.delete(id);
    return { training, sets, generation: await getDataGeneration() };
  });

/**
 * Puts a deleted training and its entries back, unchanged, only when all
 * their ids are free, every entry's exercise is missing or still has a
 * matching metric, and no restore or wipe happened since. Returns whether it ran.
 */
export const restoreTraining = ({ training, sets, generation }: TTrainingUndo) =>
  db.transaction("rw", db.exercises, db.sets, db.trainings, db.meta, async () => {
    const [currentGeneration, sameTraining, sameSets, exercises] = await Promise.all([
      getDataGeneration(),
      db.trainings.get(training.id),
      db.sets.bulkGet(sets.map((set) => set.id)),
      db.exercises.bulkGet(sets.map((set) => set.exerciseId)),
    ]);

    // Exercises are never deleted, so a missing one was already missing when
    // the training was deleted; its history comes back as it was.
    const setsFit = sets.every((set, index) => {
      const exercise = exercises[index];
      return exercise === undefined || isStoredFormFor(exercise.metric, set);
    });

    if (
      currentGeneration !== generation ||
      sameTraining ||
      sameSets.some((set) => set !== undefined) ||
      !setsFit
    ) {
      return false;
    }

    await db.trainings.add(training);
    await db.sets.bulkAdd(sets);
    return true;
  });
