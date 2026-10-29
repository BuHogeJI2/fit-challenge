import { parseDateKey } from "../dates";
import { bumpDataGeneration, db } from "../db";
import type { TBackupData, TBackupFile } from "./backup.types";

export const exportData = (): Promise<TBackupFile> =>
  db.transaction("r", db.weightEntries, db.exercises, db.sets, db.settings, async () => {
    const [weightEntries, exercises, sets, settings] = await Promise.all([
      db.weightEntries.toArray(),
      db.exercises.toArray(),
      db.sets.toArray(),
      db.settings.toArray(),
    ]);

    return {
      app: "fit",
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      data: { weightEntries, exercises, sets, settings },
    };
  });

export const serializeBackup = (file: TBackupFile): string => JSON.stringify(file, null, 2);

export const getBackupFileName = (todayKey: string): string => {
  if (parseDateKey(todayKey) === null) throw new RangeError("Expected a valid YYYY-MM-DD date.");
  return `fit-${todayKey}.json`;
};

const clearData = async () => {
  await db.weightEntries.clear();
  await db.exercises.clear();
  await db.sets.clear();
  await db.settings.clear();
};

export const restoreBackup = (data: TBackupData): Promise<void> =>
  db.transaction("rw", [db.weightEntries, db.exercises, db.sets, db.settings, db.meta], async () => {
    await clearData();
    await db.weightEntries.bulkAdd(data.weightEntries);
    await db.exercises.bulkAdd(data.exercises);
    await db.sets.bulkAdd(data.sets);
    await db.settings.bulkAdd(data.settings);
    await bumpDataGeneration();
  });

export const wipeAllData = (): Promise<void> =>
  db.transaction("rw", [db.weightEntries, db.exercises, db.sets, db.settings, db.meta], async () => {
    await clearData();
    await bumpDataGeneration();
  });
