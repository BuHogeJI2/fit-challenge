import type { TExercise, TSet, TSettingRecord, TWeightEntry } from "../db";

export type TBackupData = {
  weightEntries: TWeightEntry[];
  exercises: TExercise[];
  sets: TSet[];
  settings: TSettingRecord[];
};

export type TBackupFile = {
  app: "fit";
  schemaVersion: 1;
  exportedAt: string;
  data: TBackupData;
};

export type TBackupCounts = { [K in keyof TBackupData]: number };

export type TParseBackupResult =
  | { ok: true; data: TBackupData; counts: TBackupCounts; exportedAt: string }
  | { ok: false; errors: string[] };
