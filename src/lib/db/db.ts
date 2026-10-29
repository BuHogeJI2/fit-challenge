import Dexie, { type EntityTable } from "dexie";
import type {
  TExercise,
  TMetaRecord,
  TProgressView,
  TSet,
  TSettingRecord,
  TWeightEntry,
} from "./db.types";

export const DATABASE_NAME = "fit";

export const DEFAULT_PROGRESS_VIEW: TProgressView = "total";

export class FitDatabase extends Dexie {
  weightEntries!: EntityTable<TWeightEntry, "id">;
  exercises!: EntityTable<TExercise, "id">;
  sets!: EntityTable<TSet, "id">;
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
  }
}

export const db = new FitDatabase();
