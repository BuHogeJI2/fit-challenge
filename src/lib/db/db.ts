import Dexie, { type EntityTable, type Transaction } from "dexie";
import type {
  TDatabaseNotice,
  TExercise,
  TMetaRecord,
  TProgressView,
  TSet,
  TSettingRecord,
  TTraining,
  TWeightEntry,
} from "./db.types";
import { groupLegacySets } from "./legacy-trainings";
import { createId } from "./record-fields";

export const DATABASE_NAME = "fit";

export const DEFAULT_PROGRESS_VIEW: TProgressView = "total";

type TStoredSet = Omit<TSet, "trainingId"> & { trainingId?: string };

const linkSetsToTrainings = async (transaction: Transaction) => {
  const setsTable = transaction.table<TStoredSet, string>("sets");
  const trainingsTable = transaction.table<TTraining, string>("trainings");
  const legacySets = await setsTable.toArray();
  const grouped = groupLegacySets(legacySets, createId);

  await trainingsTable.bulkAdd(grouped.trainings);
  await setsTable.bulkPut(grouped.sets);

  const trainingDates = new Map(grouped.trainings.map((training) => [training.id, training.date]));
  const linked = await setsTable.toArray();
  const isComplete =
    linked.length === legacySets.length &&
    linked.every((set) => set.trainingId !== undefined && trainingDates.get(set.trainingId) === set.date);
  if (!isComplete) {
    // Throwing aborts the upgrade, so the database stays at the old version.
    throw new Error("Linking sets to trainings did not complete. Nothing was changed.");
  }
};

export class FitDatabase extends Dexie {
  weightEntries!: EntityTable<TWeightEntry, "id">;
  exercises!: EntityTable<TExercise, "id">;
  sets!: EntityTable<TSet, "id">;
  trainings!: EntityTable<TTraining, "id">;
  settings!: EntityTable<TSettingRecord, "key">;
  meta!: EntityTable<TMetaRecord, "key">;

  constructor(name = DATABASE_NAME) {
    super(name);

    this.version(1).stores({
      weightEntries: "id, &date",
      exercises: "id",
      sets: "id, exerciseId, date, [exerciseId+date]",
      settings: "key",
      meta: "key",
    });

    this.version(2).upgrade((transaction) =>
      transaction
        .table<TExercise>("exercises")
        .toCollection()
        .modify((exercise) => {
          exercise.progressView ??= DEFAULT_PROGRESS_VIEW;
        }),
    );

    this.version(3)
      .stores({
        sets: "id, exerciseId, trainingId, date, [exerciseId+date]",
        trainings: "id, date",
      })
      .upgrade(linkSetsToTrainings);
  }
}

export const db = new FitDatabase();

let databaseNotice: TDatabaseNotice | null = null;
const noticeListeners = new Set<(notice: TDatabaseNotice) => void>();

const announce = (notice: TDatabaseNotice) => {
  databaseNotice = notice;
  noticeListeners.forEach((listener) => listener(notice));
};

// Dexie's own handler closes this connection so the other window can
// upgrade; this only tells the screens why the data stopped loading.
db.on("versionchange", (event) => {
  if (event.newVersion !== null && event.newVersion > event.oldVersion) {
    announce("updated_elsewhere");
  }
});

db.on("blocked", (event) => {
  if (event.newVersion !== null && event.newVersion > event.oldVersion) {
    announce("upgrade_blocked");
  }
});

// A blocked upgrade is over once the database opens; screens mounted later
// must not show it again.
db.on(
  "ready",
  () => {
    if (databaseNotice === "upgrade_blocked") databaseNotice = null;
  },
  true,
);

/** Returns the latest database notice, or null when there was none. */
export const getDatabaseNotice = () => databaseNotice;

/**
 * Calls `listener` when another window upgrades the database or an old
 * window blocks this window's upgrade. Returns the unsubscribe function.
 */
export const subscribeDatabaseNotice = (listener: (notice: TDatabaseNotice) => void) => {
  noticeListeners.add(listener);
  return () => {
    noticeListeners.delete(listener);
  };
};
