import { getDataGeneration } from "./data-generation";
import { db } from "./db";
import type { TPendingUndo, TWeightEntry } from "./db.types";
import {
  assertDateKey,
  createId,
  normalizeBodyWeightKg,
  normalizeNote,
  now,
} from "./record-fields";
import { RepositoryError } from "./repository-error";

export type TWeightEntryInput = {
  date: string;
  weightKg: number;
  note?: string | null;
};

/**
 * Saves a weight entry. With `existingId` it edits that entry; without it,
 * the entry for `input.date` is created or replaced. Any other entry already
 * on the target date is removed, so each date keeps one entry.
 */
export const saveWeightEntry = async (
  input: TWeightEntryInput,
  existingId?: string,
): Promise<TWeightEntry> => {
  assertDateKey(input.date);
  const weightKg = normalizeBodyWeightKg(input.weightKg);

  return db.transaction("rw", db.weightEntries, async () => {
    const occupant = await db.weightEntries.where("date").equals(input.date).first();
    const target = existingId
      ? await db.weightEntries.get(existingId)
      : occupant;

    if (existingId && !target) {
      throw new RepositoryError("not_found", "This weight entry no longer exists.");
    }

    const timestamp = now();
    const fields = {
      date: input.date,
      weightKg,
      note: normalizeNote(input.note),
      updatedAt: timestamp,
    };

    if (!target) {
      const entry: TWeightEntry = {
        id: createId(),
        createdAt: timestamp,
        ...fields,
      };
      await db.weightEntries.add(entry);
      return entry;
    }

    if (occupant && occupant.id !== target.id) {
      await db.weightEntries.delete(occupant.id);
    }

    const entry: TWeightEntry = { ...target, ...fields };
    await db.weightEntries.put(entry);
    return entry;
  });
};

export const getWeightEntryByDate = (date: string) =>
  db.weightEntries.where("date").equals(date).first();

export const listWeightEntries = () => db.weightEntries.orderBy("date").toArray();

export const deleteWeightEntry = (
  id: string,
): Promise<TPendingUndo<TWeightEntry> | null> =>
  db.transaction("rw", db.weightEntries, db.meta, async () => {
    const record = await db.weightEntries.get(id);
    if (!record) {
      return null;
    }

    await db.weightEntries.delete(id);
    return { record, generation: await getDataGeneration() };
  });

/**
 * Puts a deleted entry back, unchanged, only when its id and date are still
 * free and no restore or wipe happened since it was deleted.
 * Returns whether the entry was restored.
 */
export const restoreWeightEntry = ({ record, generation }: TPendingUndo<TWeightEntry>) =>
  db.transaction("rw", db.weightEntries, db.meta, async () => {
    const [currentGeneration, sameId, sameDate] = await Promise.all([
      getDataGeneration(),
      db.weightEntries.get(record.id),
      db.weightEntries.where("date").equals(record.date).first(),
    ]);

    if (currentGeneration !== generation || sameId || sameDate) {
      return false;
    }

    await db.weightEntries.add(record);
    return true;
  });
