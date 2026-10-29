import { parseDateKey } from "../dates";
import {
  DEFAULT_PROGRESS_VIEW,
  EXERCISE_NAME_MAX_LENGTH,
  normalizeSetValues,
  PROGRESS_VIEWS,
  type TExercise,
  type TMetric,
  type TProgressView,
  type TSet,
  type TSettingRecord,
  type TWeightEntry,
} from "../db";
import { roundToHundredth, roundToTenth } from "../numbers";
import type { TBackupData, TParseBackupResult } from "./backup.types";

const MAX_ERRORS = 20;
const SCHEMA_VERSIONS = [1, 2];
const TABLES = ["weightEntries", "exercises", "sets", "settings"] as const;
const WEIGHT_FIELDS = ["id", "date", "weightKg", "note", "createdAt", "updatedAt"];
const EXERCISE_FIELDS = [
  "id", "name", "metric", "metricLockedAt", "progressWeightKg", "progressView", "archivedAt", "createdAt",
  "updatedAt",
];
const SET_FIELDS = [
  "id", "exerciseId", "date", "reps", "weightKg", "seconds", "note", "createdAt", "updatedAt",
];

type TRecord = Record<string, unknown>;
type TReport = (message: string) => void;

const isRecord = (value: unknown): value is TRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const hasFields = (value: TRecord, fields: readonly string[]) =>
  Object.keys(value).length === fields.length &&
  fields.every((field) => Object.hasOwn(value, field));

const isId = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isNote = (value: unknown): value is string | null => value === null || typeof value === "string";
const isDate = (value: unknown): value is string => typeof value === "string" && parseDateKey(value) !== null;

const isTimestamp = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const time = Date.parse(value);
  // Latest-set ordering compares strings, so imports need the same UTC form as writes.
  return parseDateKey(value.slice(0, 10)) !== null &&
    Number.isFinite(time) && new Date(time).toISOString() === value;
};

const isNullableTimestamp = (value: unknown): value is string | null => value === null || isTimestamp(value);

const isWeight = (value: unknown, decimals: 1 | 2): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 &&
  (decimals === 1 ? roundToTenth(value) : roundToHundredth(value)) === value;

const isNullableCount = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0);

const isMetric = (value: unknown): value is TMetric =>
  value === "reps" || value === "reps_weight" || value === "time";

const isProgressView = (value: unknown): value is TProgressView =>
  PROGRESS_VIEWS.includes(value as TProgressView);

// Schema 1 predates the per-exercise progress view.
const upgradeExerciseFromV1 = (value: unknown) =>
  isRecord(value) && !Object.hasOwn(value, "progressView")
    ? { ...value, progressView: DEFAULT_PROGRESS_VIEW }
    : value;

const readWeight = (value: unknown, report: TReport): TWeightEntry | null => {
  if (!isRecord(value) || !hasFields(value, WEIGHT_FIELDS)) {
    report("expected exactly id, date, weightKg, note, createdAt and updatedAt.");
    return null;
  }
  const { id, date, weightKg, note, createdAt, updatedAt } = value;
  if (!isId(id)) {
    report("id must be a non-empty string.");
    return null;
  }
  if (!isDate(date)) {
    report("date must be a real YYYY-MM-DD date.");
    return null;
  }
  if (!isWeight(weightKg, 1)) {
    report("weightKg must be positive with at most one decimal.");
    return null;
  }
  if (!isNote(note)) {
    report("note must be a string or null.");
    return null;
  }
  if (!isTimestamp(createdAt) || !isTimestamp(updatedAt)) {
    report("createdAt and updatedAt must be UTC timestamps in YYYY-MM-DDTHH:mm:ss.sssZ form.");
    return null;
  }
  return { id, date, weightKg, note, createdAt, updatedAt };
};

const readExercise = (value: unknown, report: TReport): TExercise | null => {
  if (!isRecord(value) || !hasFields(value, EXERCISE_FIELDS)) {
    report("expected exactly the exercise fields, including nullable fields.");
    return null;
  }
  const {
    id, name, metric, metricLockedAt, progressWeightKg, progressView, archivedAt, createdAt, updatedAt,
  } = value;
  if (!isId(id)) {
    report("id must be a non-empty string.");
    return null;
  }
  if (typeof name !== "string" || !name.trim() || name.length > EXERCISE_NAME_MAX_LENGTH) {
    report(`name must contain 1 to ${EXERCISE_NAME_MAX_LENGTH} characters.`);
    return null;
  }
  if (!isMetric(metric)) {
    report("metric must be reps, reps_weight or time.");
    return null;
  }
  if (!isNullableTimestamp(metricLockedAt) || !isNullableTimestamp(archivedAt) ||
      !isTimestamp(createdAt) || !isTimestamp(updatedAt)) {
    report("createdAt, updatedAt and non-null lock/archive dates must be UTC timestamps in YYYY-MM-DDTHH:mm:ss.sssZ form.");
    return null;
  }
  if (progressWeightKg !== null && !isWeight(progressWeightKg, 2)) {
    report("progressWeightKg must be null or positive with at most two decimals.");
    return null;
  }
  if (metric !== "reps_weight" && progressWeightKg !== null) {
    report("progressWeightKg must be null for this metric.");
    return null;
  }
  if (!isProgressView(progressView)) {
    report("progressView must be total or best.");
    return null;
  }
  return { id, name, metric, metricLockedAt, progressWeightKg, progressView, archivedAt, createdAt, updatedAt };
};

const readSet = (value: unknown, report: TReport): TSet | null => {
  if (!isRecord(value) || !hasFields(value, SET_FIELDS)) {
    report("expected exactly the set fields, including nullable fields.");
    return null;
  }
  const { id, exerciseId, date, reps, weightKg, seconds, note, createdAt, updatedAt } = value;
  if (!isId(id) || !isId(exerciseId)) {
    report("id and exerciseId must be non-empty strings.");
    return null;
  }
  if (!isDate(date)) {
    report("date must be a real YYYY-MM-DD date.");
    return null;
  }
  if (!isNullableCount(reps) || !isNullableCount(seconds)) {
    report("reps and seconds must be null or positive safe integers.");
    return null;
  }
  if (weightKg !== null && !isWeight(weightKg, 2)) {
    report("weightKg must be null or positive with at most two decimals.");
    return null;
  }
  if (!isNote(note)) {
    report("note must be a string or null.");
    return null;
  }
  if (!isTimestamp(createdAt) || !isTimestamp(updatedAt)) {
    report("createdAt and updatedAt must be UTC timestamps in YYYY-MM-DDTHH:mm:ss.sssZ form.");
    return null;
  }
  return { id, exerciseId, date, reps, weightKg, seconds, note, createdAt, updatedAt };
};

const readSetting = (value: unknown, report: TReport): TSettingRecord | null => {
  if (!isRecord(value) || !hasFields(value, ["key", "value"])) {
    report("expected exactly key and value.");
    return null;
  }
  if (value.key === "goalWeightKg") {
    if (value.value === null || isWeight(value.value, 1)) {
      return { key: value.key, value: value.value };
    }
    report("goalWeightKg must be null or positive with at most one decimal.");
  } else if (value.key === "lastExportAt") {
    if (isNullableTimestamp(value.value)) return { key: value.key, value: value.value };
    report("lastExportAt must be null or a UTC timestamp in YYYY-MM-DDTHH:mm:ss.sssZ form.");
  } else {
    report("unknown setting key; expected goalWeightKg or lastExportAt.");
  }
  return null;
};

const recordLabel = (table: string, index: number, value: unknown) => {
  const id = isRecord(value) ? value.id ?? value.key : null;
  return `${table}[${index}]${typeof id === "string" ? ` (${JSON.stringify(id)})` : ""}`;
};

const readTable = <T>(
  values: unknown[], table: string, read: (value: unknown, report: TReport) => T | null, report: TReport,
): T[] => {
  const records: T[] = [];
  values.forEach((value, index) => {
    const record = read(value, (message) => report(`${recordLabel(table, index, value)}: ${message}`));
    if (record !== null) records.push(record);
  });
  return records;
};

const checkUnique = (
  values: readonly unknown[], table: string, field: string, report: TReport,
) => {
  const seen = new Set<unknown>();
  values.forEach((value, index) => {
    if (!isRecord(value) || typeof value[field] !== "string") return;
    if (seen.has(value[field])) report(`${recordLabel(table, index, value)}: duplicate ${field}.`);
    seen.add(value[field]);
  });
};

const checkRelationships = (data: TBackupData, report: TReport) => {
  const exercises = new Map(data.exercises.map((exercise) => [exercise.id, exercise]));
  data.sets.forEach((set, index) => {
    const label = recordLabel("sets", index, set);
    const exercise = exercises.get(set.exerciseId);
    if (!exercise) {
      report(`${label}: exerciseId does not refer to an exercise.`);
      return;
    }
    if (exercise.metricLockedAt === null) {
      report(`${label}: exercise ${JSON.stringify(exercise.id)} needs metricLockedAt because it has sets.`);
    }
    try {
      const normalized = normalizeSetValues(exercise.metric, set);
      if (normalized.reps !== set.reps || normalized.weightKg !== set.weightKg || normalized.seconds !== set.seconds) {
        report(`${label}: values must already be in the stored form for ${exercise.metric}.`);
      }
    } catch {
      report(`${label}: values do not match the exercise metric ${exercise.metric}.`);
    }
  });
};

export const parseBackup = (text: string): TParseBackupResult => {
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    return { ok: false, errors: ["Backup: invalid JSON."] };
  }

  const errors: string[] = [];
  const report: TReport = (message) => {
    if (errors.length < MAX_ERRORS) errors.push(message);
  };
  if (!isRecord(input) || !hasFields(input, ["app", "schemaVersion", "exportedAt", "data"])) {
    return { ok: false, errors: ["Backup: expected exactly app, schemaVersion, exportedAt and data."] };
  }
  if (input.app !== "fit") report('Backup: app must be "fit".');
  if (!SCHEMA_VERSIONS.includes(input.schemaVersion as number)) report("Backup: schemaVersion must be 1 or 2.");
  if (!isTimestamp(input.exportedAt)) report("Backup: exportedAt must be a UTC timestamp in YYYY-MM-DDTHH:mm:ss.sssZ form.");
  if (!isRecord(input.data) || !hasFields(input.data, TABLES)) {
    report("Backup data: expected exactly weightEntries, exercises, sets and settings.");
    return { ok: false, errors };
  }
  const { weightEntries, exercises, sets, settings } = input.data;
  if (!Array.isArray(weightEntries) || !Array.isArray(exercises) || !Array.isArray(sets) || !Array.isArray(settings)) {
    report("Backup data: weightEntries, exercises, sets and settings must all be arrays.");
    return { ok: false, errors };
  }

  const data: TBackupData = {
    weightEntries: readTable(weightEntries, "weightEntries", readWeight, report),
    exercises: readTable(
      input.schemaVersion === 1 ? exercises.map(upgradeExerciseFromV1) : exercises,
      "exercises", readExercise, report,
    ),
    sets: readTable(sets, "sets", readSet, report),
    settings: readTable(settings, "settings", readSetting, report),
  };
  checkUnique(weightEntries, "weightEntries", "id", report);
  checkUnique(exercises, "exercises", "id", report);
  checkUnique(sets, "sets", "id", report);
  checkUnique(weightEntries, "weightEntries", "date", report);
  checkUnique(settings, "settings", "key", report);
  if (errors.length === 0) checkRelationships(data, report);
  if (errors.length > 0 || !isTimestamp(input.exportedAt)) return { ok: false, errors };

  return {
    ok: true, data, exportedAt: input.exportedAt,
    counts: {
      weightEntries: data.weightEntries.length, exercises: data.exercises.length,
      sets: data.sets.length, settings: data.settings.length,
    },
  };
};
