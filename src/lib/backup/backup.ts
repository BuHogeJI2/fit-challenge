import { parseDateKey } from "../dates";
import { bumpDataGeneration, db } from "../db";
import type { TBackupData, TBackupFile } from "./backup.types";

const dataTables = () => [db.weightEntries, db.exercises, db.trainings, db.sets, db.settings];

export const exportData = (): Promise<TBackupFile> =>
  db.transaction("r", dataTables(), async () => {
    const [weightEntries, exercises, trainings, sets, settings] = await Promise.all([
      db.weightEntries.toArray(),
      db.exercises.toArray(),
      db.trainings.toArray(),
      db.sets.toArray(),
      db.settings.toArray(),
    ]);

    return {
      app: "fit",
      schemaVersion: 4,
      exportedAt: new Date().toISOString(),
      data: { weightEntries, exercises, trainings, sets, settings },
    };
  });

export const serializeBackup = (file: TBackupFile): string => JSON.stringify(file, null, 2);

export const getBackupFileName = (todayKey: string): string => {
  if (parseDateKey(todayKey) === null) throw new RangeError("Expected a valid YYYY-MM-DD date.");
  return `fit-${todayKey}.json`;
};

const clearData = async () => {
  for (const table of dataTables()) {
    await table.clear();
  }
};

export const restoreBackup = (data: TBackupData): Promise<void> =>
  db.transaction("rw", [...dataTables(), db.meta], async () => {
    await clearData();
    await db.weightEntries.bulkAdd(data.weightEntries);
    await db.exercises.bulkAdd(data.exercises);
    await db.trainings.bulkAdd(data.trainings);
    await db.sets.bulkAdd(data.sets);
    await db.settings.bulkAdd(data.settings);
    await bumpDataGeneration();
  });

export const wipeAllData = (): Promise<void> =>
  db.transaction("rw", [...dataTables(), db.meta], async () => {
    await clearData();
    await bumpDataGeneration();
  });
