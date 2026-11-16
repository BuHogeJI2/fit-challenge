import { parseDateKey } from "../dates";
import {
  DEFAULT_PROGRESS_VIEW,
  EXERCISE_NAME_MAX_LENGTH,
  groupLegacySets,
  normalizeSetValues,
  PROGRESS_VIEWS,
  type TExercise,
  type TMetric,
  type TProgressView,
  type TSet,
  type TSettingRecord,
  type TTraining,
  type TWeightEntry,
  TRAINING_NAME_MAX_LENGTH,
} from "../db";
import { roundToHundredth, roundToTenth } from "../numbers";
import type { TBackupData, TParseBackupResult } from "./backup.types";

const MAX_ERRORS = 20;
const SCHEMA_VERSIONS = [1, 2, 3, 4];
const LEGACY_TABLES = ["weightEntries", "exercises", "sets", "settings"];
const TABLES = ["weightEntries", "exercises", "trainings", "sets", "settings"];
const WEIGHT_FIELDS = ["id", "date", "weightKg", "note", "createdAt", "updatedAt"];
const EXERCISE_FIELDS = [
  "id", "name", "metric", "metricLockedAt", "progressWeightKg", "progressView", "archivedAt", "createdAt",
  "updatedAt",
];
const LEGACY_SET_FIELDS = [
  "id", "exerciseId", "date", "reps", "weightKg", "seconds", "note", "createdAt", "updatedAt",
];
const SET_FIELDS = [...LEGACY_SET_FIELDS, "trainingId"];
const TRAINING_FIELDS = ["id", "date", "name", "note", "createdAt", "updatedAt"];

type TRecord = Record<string, unknown>;
type TReport = (message: string) => void;
type TParsedSet = Omit<TSet, "trainingId"> & { trainingId?: string };

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
  value === "reps" || value === "reps_weight" || value === "time" || value === "session";

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
    report("metric must be reps, reps_weight, time or session.");
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
  if (metric === "session" && progressView !== "total") {
    report("progressView must be total for session.");
    return null;
  }
  return { id, name, metric, metricLockedAt, progressWeightKg, progressView, archivedAt, createdAt, updatedAt };
};

const readTraining = (value: unknown, report: TReport): TTraining | null => {
  if (!isRecord(value) || !hasFields(value, TRAINING_FIELDS)) {
    report("expected exactly id, date, name, note, createdAt and updatedAt.");
    return null;
  }
  const { id, date, name, note, createdAt, updatedAt } = value;
  if (!isId(id)) {
    report("id must be a non-empty string.");
    return null;
  }
  if (!isDate(date)) {
    report("date must be a real YYYY-MM-DD date.");
    return null;
  }
  if (name !== null && (typeof name !== "string" || !name.trim() || name.length > TRAINING_NAME_MAX_LENGTH)) {
    report(`name must be null or contain 1 to ${TRAINING_NAME_MAX_LENGTH} characters.`);
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
  return { id, date, name, note, createdAt, updatedAt };
};

const readSetWith = (fields: readonly string[]) => (value: unknown, report: TReport): TParsedSet | null => {
  if (!isRecord(value) || !hasFields(value, fields)) {
    report("expected exactly the set fields, including nullable fields.");
    return null;
  }
  const { id, exerciseId, trainingId, date, reps, weightKg, seconds, note, createdAt, updatedAt } = value;
  if (!isId(id) || !isId(exerciseId)) {
    report("id and exerciseId must be non-empty strings.");
    return null;
  }
  if (Object.hasOwn(value, "trainingId") && !isId(trainingId)) {
    report("trainingId must be a non-empty string.");
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
  const set = { id, exerciseId, date, reps, weightKg, seconds, note, createdAt, updatedAt };
  return isId(trainingId) ? { ...set, trainingId } : set;
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

const checkRelationships = (
  exerciseList: TExercise[], trainingList: TTraining[] | null, sets: TParsedSet[], report: TReport,
) => {
  const exercises = new Map(exerciseList.map((exercise) => [exercise.id, exercise]));
  const trainings = trainingList && new Map(trainingList.map((training) => [training.id, training]));
  sets.forEach((set, index) => {
    const label = recordLabel("sets", index, set);
    if (trainings) {
      const training = set.trainingId === undefined ? undefined : trainings.get(set.trainingId);
      if (!training) {
        report(`${label}: trainingId does not refer to a training.`);
      } else if (training.date !== set.date) {
        report(`${label}: date must match the date of its training.`);
      }
    }
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
  if (!SCHEMA_VERSIONS.includes(input.schemaVersion as number)) report("Backup: schemaVersion must be 1, 2, 3 or 4.");
  if (!isTimestamp(input.exportedAt)) report("Backup: exportedAt must be a UTC timestamp in YYYY-MM-DDTHH:mm:ss.sssZ form.");
  // Schemas 1 to 3 predate trainings: their sets get one training per date below.
  const isLegacy = input.schemaVersion === 1 || input.schemaVersion === 2 || input.schemaVersion === 3;
  const tables = isLegacy ? LEGACY_TABLES : TABLES;
  if (!isRecord(input.data) || !hasFields(input.data, tables)) {
    report(`Backup data: expected exactly ${tables.join(", ")}.`);
    return { ok: false, errors };
  }
  const { weightEntries, exercises, sets, settings } = input.data;
  const trainings = isLegacy ? [] : input.data.trainings;
  if (
    !Array.isArray(weightEntries) || !Array.isArray(exercises) || !Array.isArray(trainings) ||
    !Array.isArray(sets) || !Array.isArray(settings)
  ) {
    report(`Backup data: ${tables.join(", ")} must all be arrays.`);
    return { ok: false, errors };
  }

  const parsedWeights = readTable(weightEntries, "weightEntries", readWeight, report);
  const parsedExercises = readTable(
    input.schemaVersion === 1 ? exercises.map(upgradeExerciseFromV1) : exercises,
    "exercises", readExercise, report,
  );
  const parsedTrainings = readTable(trainings, "trainings", readTraining, report);
  const parsedSets = readTable(sets, "sets", readSetWith(isLegacy ? LEGACY_SET_FIELDS : SET_FIELDS), report);
  const parsedSettings = readTable(settings, "settings", readSetting, report);
  checkUnique(weightEntries, "weightEntries", "id", report);
  checkUnique(exercises, "exercises", "id", report);
  checkUnique(trainings, "trainings", "id", report);
  checkUnique(sets, "sets", "id", report);
  checkUnique(weightEntries, "weightEntries", "date", report);
  checkUnique(settings, "settings", "key", report);
  if (errors.length === 0) checkRelationships(parsedExercises, isLegacy ? null : parsedTrainings, parsedSets, report);
  if (errors.length > 0 || !isTimestamp(input.exportedAt)) return { ok: false, errors };

  const linked = isLegacy
    ? groupLegacySets(parsedSets, () => crypto.randomUUID())
    : { trainings: parsedTrainings, sets: parsedSets as TSet[] };
  const result: TBackupData = {
    weightEntries: parsedWeights,
    exercises: parsedExercises,
    trainings: linked.trainings,
    sets: linked.sets,
    settings: parsedSettings,
  };

  return {
    ok: true, data: result, exportedAt: input.exportedAt,
    counts: {
      weightEntries: result.weightEntries.length, exercises: result.exercises.length,
      trainings: result.trainings.length, sets: result.sets.length, settings: result.settings.length,
    },
  };
};
