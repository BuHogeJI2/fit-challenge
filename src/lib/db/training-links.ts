import { db } from "./db";
import type { TTraining, TTrainingTarget } from "./db.types";
import { createId } from "./record-fields";
import { RepositoryError } from "./repository-error";
import { listTrainingsOnDate, resolveTrainingTarget } from "./trainings.repo";

type TTrainingForEntry = {
  training: TTraining;
  created: boolean;
};

const isDisposable = (training: TTraining) => training.name === null && training.note === null;

/**
 * Returns the training an entry on `date` belongs to, creating it when the
 * target asks for a new one. Run inside a transaction over `db.trainings`.
 */
export const takeTrainingForEntry = async (
  date: string,
  target: TTrainingTarget | undefined,
  timestamp: string,
): Promise<TTrainingForEntry> => {
  const resolved = resolveTrainingTarget(target ? [] : await listTrainingsOnDate(date), target);

  if ("trainingId" in resolved) {
    const training = await db.trainings.get(resolved.trainingId);
    if (!training) {
      throw new RepositoryError("not_found", "This training no longer exists.");
    }
    if (training.date !== date) {
      throw new RepositoryError("invalid_input", "This training is on another date.");
    }
    return { training, created: false };
  }

  const training: TTraining = {
    id: createId(),
    date,
    name: null,
    note: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await db.trainings.add(training);
  return { training, created: true };
};

/**
 * Removes a training without a name or note once it has no entries left.
 * Returns the removed training, or null. Run inside a transaction over
 * `db.sets` and `db.trainings`.
 */
export const removeTrainingIfEmpty = async (trainingId: string) => {
  const training = await db.trainings.get(trainingId);
  if (!training || !isDisposable(training)) {
    return null;
  }
  if ((await db.sets.where("trainingId").equals(trainingId).count()) > 0) {
    return null;
  }
  await db.trainings.delete(trainingId);
  return training;
};
