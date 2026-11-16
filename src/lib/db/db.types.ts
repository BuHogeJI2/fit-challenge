export type TMetric = "reps" | "reps_weight" | "time" | "session";

export type TProgressView = "total" | "best";

export type TWeightEntry = {
  id: string;
  date: string;
  weightKg: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TExercise = {
  id: string;
  name: string;
  metric: TMetric;
  metricLockedAt: string | null;
  progressWeightKg: number | null;
  progressView: TProgressView;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TTraining = {
  id: string;
  date: string;
  name: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TTrainingTarget = { trainingId: string } | { newTraining: true };

export type TSet = {
  id: string;
  exerciseId: string;
  trainingId: string;
  date: string;
  reps: number | null;
  weightKg: number | null;
  seconds: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TSettingValues = {
  goalWeightKg: number | null;
  lastExportAt: string | null;
};

export type TSettingKey = keyof TSettingValues;

export type TSettingRecord = {
  [K in TSettingKey]: { key: K; value: TSettingValues[K] };
}[TSettingKey];

export const DATA_GENERATION_KEY = "dataGeneration";

export type TMetaRecord = {
  key: typeof DATA_GENERATION_KEY;
  value: number;
};

export type TRepositoryErrorCode =
  | "invalid_input"
  | "not_found"
  | "metric_locked"
  | "archived"
  | "training_choice_required";

export type TPendingUndo<T> = {
  record: T;
  generation: number;
};

/**
 * `training` is the parent that the same operation created (add) or removed
 * together with its last entry (delete), or null when the parent was left
 * as it was.
 */
export type TSetUndo = TPendingUndo<TSet> & {
  training: TTraining | null;
};

export type TTrainingUndo = {
  training: TTraining;
  sets: TSet[];
  generation: number;
};

export type TDatabaseNotice = "updated_elsewhere" | "upgrade_blocked";
