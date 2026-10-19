export type TMetric = "reps" | "reps_weight" | "time";

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
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TSet = {
  id: string;
  exerciseId: string;
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
  | "archived";

export type TPendingUndo<T> = {
  record: T;
  generation: number;
};
