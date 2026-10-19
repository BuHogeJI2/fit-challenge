import Dexie, { type EntityTable } from "dexie";
import type {
  TExercise,
  TMetaRecord,
  TSet,
  TSettingRecord,
  TWeightEntry,
} from "./db.types";

export const DATABASE_NAME = "fit";

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
  }
}

export const db = new FitDatabase();
