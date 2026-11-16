import type { TTraining } from "./db.types";

type TLegacySet = {
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type TGroupedLegacySets<S extends TLegacySet> = {
  sets: (S & { trainingId: string })[];
  trainings: TTraining[];
};

/**
 * Groups sets stored before trainings existed into one training per stored
 * date. Each set is kept as it is, unknown fields included, and only gains
 * `trainingId`. A training spans its sets' timestamps and has no name or
 * note. Used by the database upgrade and by imports of older backups.
 */
export const groupLegacySets = <S extends TLegacySet>(
  sets: readonly S[],
  createId: () => string,
): TGroupedLegacySets<S> => {
  const trainingsByDate = new Map<string, TTraining>();

  for (const set of sets) {
    const training = trainingsByDate.get(set.date);
    if (!training) {
      trainingsByDate.set(set.date, {
        id: createId(),
        date: set.date,
        name: null,
        note: null,
        createdAt: set.createdAt,
        updatedAt: set.updatedAt,
      });
      continue;
    }
    if (set.createdAt < training.createdAt) training.createdAt = set.createdAt;
    if (set.updatedAt > training.updatedAt) training.updatedAt = set.updatedAt;
  }

  return {
    sets: sets.map((set) => ({ ...set, trainingId: trainingsByDate.get(set.date)!.id })),
    trainings: [...trainingsByDate.values()],
  };
};
