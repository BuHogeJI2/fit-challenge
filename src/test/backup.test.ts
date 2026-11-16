import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  exportData,
  getBackupFileName,
  parseBackup,
  restoreBackup,
  serializeBackup,
  wipeAllData,
  type TBackupData,
  type TBackupFile,
} from "../lib/backup";
import {
  db,
  deleteWeightEntry,
  FitDatabase,
  getDataGeneration,
  restoreWeightEntry,
} from "../lib/db";
import { resetDatabase } from "./db-test-utils";

const withoutTrainingId = <T extends { trainingId?: string }>(set: T) => {
  const copy: Partial<T> = { ...set };
  delete copy.trainingId;
  return copy as Omit<T, "trainingId">;
};

const TIMESTAMP = "2026-10-19T08:30:00.000Z";
const stamp = { createdAt: TIMESTAMP, updatedAt: TIMESTAMP };

const LEGACY_TABLES = ["weightEntries", "exercises", "sets", "settings"];

const validFile = (): TBackupFile => ({
  app: "fit",
  schemaVersion: 4,
  exportedAt: TIMESTAMP,
  data: {
    weightEntries: [{ id: "weight", date: "2026-10-19", weightKg: 83.4, note: null, ...stamp }],
    exercises: [
      { id: "reps", name: "Push-ups", metric: "reps", metricLockedAt: TIMESTAMP, progressWeightKg: null, progressView: "total", archivedAt: null, ...stamp },
      { id: "load", name: "Squat", metric: "reps_weight", metricLockedAt: TIMESTAMP, progressWeightKg: 22.55, progressView: "best", archivedAt: null, ...stamp },
      { id: "time", name: "Plank", metric: "time", metricLockedAt: TIMESTAMP, progressWeightKg: null, progressView: "total", archivedAt: TIMESTAMP, ...stamp },
      { id: "session", name: "Boxing", metric: "session", metricLockedAt: TIMESTAMP, progressWeightKg: null, progressView: "total", archivedAt: null, ...stamp },
    ],
    trainings: [
      { id: "day-19", date: "2026-10-19", name: null, note: null, ...stamp },
      { id: "day-18", date: "2026-10-18", name: "Legs", note: "Gym", ...stamp },
      { id: "day-17", date: "2026-10-17", name: null, note: null, ...stamp },
      { id: "day-16", date: "2026-10-16", name: "Boxing club", note: null, ...stamp },
    ],
    sets: [
      { id: "rep-set", exerciseId: "reps", trainingId: "day-19", date: "2026-10-19", reps: 29, weightKg: null, seconds: null, note: "Easy", ...stamp },
      { id: "load-set", exerciseId: "load", trainingId: "day-18", date: "2026-10-18", reps: 12, weightKg: 22.55, seconds: null, note: null, ...stamp },
      { id: "time-set", exerciseId: "time", trainingId: "day-17", date: "2026-10-17", reps: null, weightKg: null, seconds: 105, note: null, ...stamp },
      { id: "session-set", exerciseId: "session", trainingId: "day-16", date: "2026-10-16", reps: null, weightKg: null, seconds: null, note: "Sparring", ...stamp },
    ],
    settings: [{ key: "goalWeightKg", value: 80.1 }, { key: "lastExportAt", value: TIMESTAMP }],
  },
});

type TLegacyFile = Omit<TTestFile, "data"> & { data: Record<string, Record<string, unknown>[]> };

const legacyFile = (schemaVersion: 1 | 2 | 3 = 3): TLegacyFile => {
  const { data, ...envelope } = validFile();
  return {
    ...envelope,
    schemaVersion,
    data: {
      weightEntries: data.weightEntries,
      exercises: data.exercises,
      sets: data.sets.map(withoutTrainingId),
      settings: data.settings,
    },
  };
};

const legacyText = (change: (file: TLegacyFile) => void = () => {}, schemaVersion: 1 | 2 | 3 = 3) => {
  const file = legacyFile(schemaVersion);
  change(file);
  return JSON.stringify(file);
};

type TTestFile = {
  app: unknown;
  schemaVersion: unknown;
  exportedAt: unknown;
  data: { [K in keyof TBackupData]: Record<string, unknown>[] };
};

const invalidFile = (change: (file: TTestFile) => void) => {
  const file: TTestFile = validFile();
  change(file);
  return JSON.stringify(file);
};

const expectRejected = (text: string, message: string) => {
  const result = parseBackup(text);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("Expected a rejected backup.");
  expect(result.errors.join(" ")).toContain(message);
};

describe("backup parsing", () => {
  it("returns typed data, counts and export time without changing the source", () => {
    const source = validFile();
    const text = serializeBackup(source);
    const result = parseBackup(text);

    expect(text).toContain('\n  "app": "fit",');
    expect(result).toEqual({
      ok: true, data: source.data, exportedAt: TIMESTAMP,
      counts: { weightEntries: 1, exercises: 4, trainings: 4, sets: 4, settings: 2 },
    });
    expect(serializeBackup(source)).toBe(text);
  });

  it.each(["", "{", "undefined"])("rejects malformed JSON: %s", (text) => {
    expectRejected(text, "invalid JSON");
  });

  it.each([null, [], 1, "fit", {}, { ...validFile(), extra: true }])("rejects an invalid envelope %#", (input) => {
    expectRejected(JSON.stringify(input), "Backup:");
  });

  it.each([null, [], {}, { ...validFile().data, meta: [] }, { ...validFile().data, sets: {} }])(
    "rejects invalid data shape %#", (data) => {
      expectRejected(JSON.stringify({ ...validFile(), data }), "Backup data:");
    },
  );

  it.each([
    ["app", "other", "app"], ["schemaVersion", 5, "schemaVersion"],
    ["schemaVersion", "1", "schemaVersion"], ["exportedAt", "2026-10-19", "exportedAt"],
  ])("rejects invalid %s", (field, value, message) => {
    expectRejected(invalidFile((file) => { Object.assign(file, { [field]: value }); }), String(message));
  });

  const tables = ["weightEntries", "exercises", "trainings", "sets", "settings"] as const;
  it.each(tables)("rejects missing and unknown fields in %s", (table) => {
    expectRejected(invalidFile((file) => { delete file.data[table][0]["createdAt" in file.data[table][0] ? "createdAt" : "value"]; }), `${table}[0]`);
    expectRejected(invalidFile((file) => { file.data[table][0].extra = true; }), `${table}[0]`);
    expectRejected(JSON.stringify({ ...validFile(), data: { ...validFile().data, [table]: [null] } }), `${table}[0]`);
  });

  it.each(["weightEntries", "exercises", "trainings", "sets"] as const)("requires unique non-empty ids in %s", (table) => {
    for (const id of ["", "  ", null, 123]) {
      expectRejected(invalidFile((file) => { file.data[table][0].id = id; }), `${table}[0]`);
    }
    expectRejected(invalidFile((file) => { file.data[table].push({ ...file.data[table][0] }); }), "duplicate id");
  });

  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "2026-1-01", "0000-01-01", null])(
    "rejects invalid date %s", (date) => {
      for (const table of ["weightEntries", "trainings", "sets"] as const) {
        expectRejected(invalidFile((file) => { file.data[table][0].date = date; }), `${table}[0]`);
      }
    },
  );

  it("rejects duplicate weight dates with different ids", () => {
    expectRejected(invalidFile((file) => { file.data.weightEntries.push({ ...file.data.weightEntries[0], id: "another" }); }), "duplicate date");
  });

  it.each(["2026-02-30T08:30:00.000Z", "2026-10-19T24:00:00.000Z", "2026-10-19T08:60:00.000Z", "2026-10-19T08:30:60.000Z", "2026-10-19T08:30:00", "2026-10-19T08:30:00+24:00", "2026-10-19T08:30:00.000+03:00", "2026-10-19T08:30:00.0000Z", "2026-10-19T08:30:00Z", "yesterday", 123])(
    "rejects invalid timestamps: %s", (timestamp) => {
      expectRejected(invalidFile((file) => { file.exportedAt = timestamp; }), "exportedAt");
      for (const table of ["weightEntries", "exercises", "trainings", "sets"] as const) {
        for (const field of ["createdAt", "updatedAt"]) {
          expectRejected(invalidFile((file) => { file.data[table][0][field] = timestamp; }), `${table}[0]`);
        }
      }
      for (const field of ["metricLockedAt", "archivedAt"]) {
        expectRejected(invalidFile((file) => { file.data.exercises[0][field] = timestamp; }), "exercises[0]");
      }
      expectRejected(invalidFile((file) => { file.data.settings[1].value = timestamp; }), "settings[1]");
    },
  );

  it("accepts leap days and canonical UTC timestamps unchanged", () => {
    const file = validFile();
    file.exportedAt = "2024-02-29T23:30:00.123Z";
    file.data.weightEntries[0].date = "2024-02-29";
    expect(parseBackup(serializeBackup(file))).toMatchObject({ ok: true, exportedAt: file.exportedAt, data: file.data });
  });

  it.each([0, -1, 83.44, "83.4", null, Number.MAX_VALUE])("rejects invalid body weight %s", (weightKg) => {
    expectRejected(invalidFile((file) => { file.data.weightEntries[0].weightKg = weightKg; }), "weightEntries[0]");
  });

  it("rejects non-finite JSON numbers", () => {
    expectRejected(serializeBackup(validFile()).replace('"weightKg": 83.4', '"weightKg": 1e400'), "weightEntries[0]");
  });

  it.each([0, -1, 22.555, "22.55", Number.MAX_VALUE])("rejects invalid load %s", (weightKg) => {
    expectRejected(invalidFile((file) => { file.data.sets[1].weightKg = weightKg; }), "sets[1]");
    expectRejected(invalidFile((file) => { file.data.exercises[1].progressWeightKg = weightKg; }), "exercises[1]");
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "12"])("rejects invalid count %s", (count) => {
    expectRejected(invalidFile((file) => { file.data.sets[0].reps = count; }), "sets[0]");
    expectRejected(invalidFile((file) => { file.data.sets[2].seconds = count; }), "sets[2]");
  });

  it("rejects bad names, unknown metrics, notes and exercise ids", () => {
    for (const name of [" ", null, "x".repeat(61)]) {
      expectRejected(invalidFile((file) => { file.data.exercises[0].name = name; }), "name");
    }
    expectRejected(invalidFile((file) => { file.data.exercises[0].metric = "distance"; }), "metric");
    for (const table of ["weightEntries", "sets"] as const) {
      expectRejected(invalidFile((file) => { file.data[table][0].note = 42; }), "note");
    }
    expectRejected(invalidFile((file) => { file.data.sets[0].exerciseId = " "; }), "exerciseId");
    expectRejected(invalidFile((file) => { file.data.sets[0].exerciseId = "missing"; }), "does not refer");
  });

  it("rejects bad training names and notes and keeps empty trainings", () => {
    for (const name of ["", " ", 42, "x".repeat(61)]) {
      expectRejected(invalidFile((file) => { file.data.trainings[0].name = name; }), "trainings[0]");
    }
    expectRejected(invalidFile((file) => { file.data.trainings[0].note = 42; }), "trainings[0]");
    const file = validFile();
    file.data.sets = file.data.sets.slice(1);
    expect(parseBackup(serializeBackup(file))).toMatchObject({ ok: true, data: file.data, counts: { trainings: 4, sets: 3 } });
  });

  it("requires every set to belong to a training on the same date", () => {
    expectRejected(invalidFile((file) => { delete file.data.sets[0].trainingId; }), "sets[0]");
    for (const trainingId of ["", " ", null, 7]) {
      expectRejected(invalidFile((file) => { file.data.sets[0].trainingId = trainingId; }), "trainingId must be");
    }
    expectRejected(invalidFile((file) => { file.data.sets[0].trainingId = "missing"; }), "trainingId does not refer");
    expectRejected(invalidFile((file) => { file.data.sets[0].trainingId = "day-18"; }), "date must match");
  });

  it("accepts several trainings on one date", () => {
    const file = validFile();
    file.data.trainings.push({ id: "day-19-evening", date: "2026-10-19", name: "Evening", note: null, ...stamp });
    file.data.sets.push({ ...file.data.sets[0], id: "evening-set", trainingId: "day-19-evening" });
    expect(parseBackup(serializeBackup(file))).toMatchObject({ ok: true, data: file.data, counts: { trainings: 5, sets: 5 } });
  });

  it("requires metric locks for exercises with sets but preserves permanent locks without sets", () => {
    expectRejected(invalidFile((file) => { file.data.exercises[0].metricLockedAt = null; }), "metricLockedAt");
    const file = validFile();
    file.data.sets = [];
    expect(parseBackup(serializeBackup(file))).toMatchObject({ ok: true, data: file.data });
  });

  it.each([
    [0, { reps: null }], [0, { seconds: 1 }], [0, { weightKg: 20 }],
    [1, { weightKg: null }], [1, { seconds: 1 }], [1, { reps: null }],
    [2, { seconds: null }], [2, { reps: 1 }], [2, { weightKg: 20 }],
    [3, { reps: 1 }], [3, { weightKg: 20 }], [3, { seconds: 1 }],
  ] as const)("rejects set values outside the stored metric form %#", (index, change) => {
    expectRejected(invalidFile((file) => { Object.assign(file.data.sets[index], change); }), `sets[${index}]`);
  });

  it("rejects progress loads for metrics that do not use them", () => {
    expectRejected(invalidFile((file) => { file.data.exercises[0].progressWeightKg = 20; }), "progressWeightKg must be null");
  });

  it("rejects the best set view for sessions", () => {
    expectRejected(invalidFile((file) => { file.data.exercises[3].progressView = "best"; }), "progressView must be total for session");
  });

  it.each(["volume", null, undefined])("rejects progress view %s", (progressView) => {
    expectRejected(invalidFile((file) => { file.data.exercises[0].progressView = progressView; }), "exercises[0]");
  });

  it("reads schema 1 exercises with the day total view", () => {
    const text = legacyText((file) => {
      for (const exercise of file.data.exercises) delete exercise.progressView;
    }, 1);
    const result = parseBackup(text);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected a parsed backup.");
    expect(result.data.exercises.map((exercise) => exercise.progressView)).toEqual(["total", "total", "total", "total"]);
    expectRejected(invalidFile((file) => { delete file.data.exercises[0].progressView; }), "exercises[0]");
  });

  it.each([1, 2, 3] as const)("reads schema %s sets into one training per date, keeping every field", (schemaVersion) => {
    const source = legacyFile(schemaVersion);
    if (schemaVersion === 1) for (const exercise of source.data.exercises) delete exercise.progressView;
    source.data.sets.push(
      { ...source.data.sets[0], id: "same-day", exerciseId: "session", reps: null, note: null, createdAt: "2026-10-19T07:00:00.000Z" },
      { ...source.data.sets[0], id: "same-day-later", updatedAt: "2026-10-19T21:00:00.000Z" },
    );
    const result = parseBackup(JSON.stringify(source));
    if (!result.ok) throw new Error(result.errors.join(" "));

    expect(result.counts).toEqual({ weightEntries: 1, exercises: 4, trainings: 4, sets: 6, settings: 2 });
    expect(result.data.sets.map(withoutTrainingId)).toEqual(source.data.sets);
    const trainingByDate = new Map(result.data.trainings.map((training) => [training.date, training]));
    expect(trainingByDate.size).toBe(4);
    for (const set of result.data.sets) {
      expect(trainingByDate.get(set.date)?.id).toBe(set.trainingId);
    }
    expect(trainingByDate.get("2026-10-19")).toMatchObject({
      name: null, note: null, createdAt: "2026-10-19T07:00:00.000Z", updatedAt: "2026-10-19T21:00:00.000Z",
    });
    expect(result.data.weightEntries).toEqual(source.data.weightEntries);
    expect(result.data.settings).toEqual(source.data.settings);
  });

  it("rejects trainings in files written before trainings existed", () => {
    expectRejected(legacyText((file) => { file.data.trainings = []; }), "Backup data:");
    expectRejected(legacyText((file) => { file.data.sets[0].trainingId = "day-19"; }), "sets[0]");
    expectRejected(legacyText((file) => { file.data.sets[0].reps = 0; }), "sets[0]");
    expectRejected(legacyText((file) => { file.data.sets[0].exerciseId = "missing"; }), "does not refer");
    const missingTrainings: Omit<TBackupFile, "data"> & { data: Partial<TBackupData> } = validFile();
    delete missingTrainings.data.trainings;
    expectRejected(JSON.stringify(missingTrainings), `Backup data: expected exactly ${["weightEntries", "exercises", "trainings", "sets", "settings"].join(", ")}`);
    expect(LEGACY_TABLES).toEqual(Object.keys(legacyFile().data));
  });

  it("requires unique, known setting keys and valid values", () => {
    expectRejected(invalidFile((file) => { file.data.settings.push({ ...file.data.settings[0] }); }), "duplicate key");
    expectRejected(invalidFile((file) => { file.data.settings[0].key = "theme"; }), "unknown setting key");
    for (const value of [0, -1, 80.11, "80", Number.MAX_VALUE]) {
      expectRejected(invalidFile((file) => { file.data.settings[0].value = value; }), "settings[0]");
    }
    const file = validFile();
    file.data.settings = [{ key: "goalWeightKg", value: null }, { key: "lastExportAt", value: null }];
    expect(parseBackup(serializeBackup(file))).toMatchObject({ ok: true, data: file.data });
    file.data.settings = [];
    expect(parseBackup(serializeBackup(file))).toMatchObject({ ok: true, counts: { settings: 0 } });
    file.data.settings = [{ key: "goalWeightKg", value: 80 }];
    expect(parseBackup(serializeBackup(file))).toMatchObject({ ok: true, counts: { settings: 1 } });
  });

  it("caps errors at 20 and names the source table, index and id", () => {
    const text = invalidFile((file) => {
      file.data.weightEntries = Array.from({ length: 30 }, (_, index) => ({
        ...file.data.weightEntries[0], id: `bad-${index}`, weightKg: -1,
      }));
    });
    const result = parseBackup(text);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected errors.");
    expect(result.errors).toHaveLength(20);
    expect(result.errors[0]).toContain('weightEntries[0] ("bad-0")');
    expect(result.errors[19]).toContain('weightEntries[19] ("bad-19")');
  });

  it("formats the filename and rejects impossible filename dates", () => {
    expect(getBackupFileName("2026-10-19")).toBe("fit-2026-10-19.json");
    expect(() => getBackupFileName("2026-02-30")).toThrow(RangeError);
  });
});

describe("backup persistence", () => {
  beforeEach(resetDatabase);
  afterEach(() => vi.restoreAllMocks());

  const snapshot = async () => ({ data: (await exportData()).data, meta: await db.meta.toArray() });

  it("round-trips all five tables and excludes meta", async () => {
    await restoreBackup(validFile().data);
    const exported = await exportData();
    const parsed = parseBackup(serializeBackup(exported));
    if (!parsed.ok) throw new Error(parsed.errors.join(" "));
    expect(exported.schemaVersion).toBe(4);
    expect(Object.keys(exported.data).sort()).toEqual(["exercises", "sets", "settings", "trainings", "weightEntries"]);
    expect(parsed.counts).toEqual({ weightEntries: 1, exercises: 4, trainings: 4, sets: 4, settings: 2 });
    expect(Number.isFinite(Date.parse(parsed.exportedAt))).toBe(true);
    await wipeAllData();
    await restoreBackup(parsed.data);
    expect((await exportData()).data).toEqual(exported.data);
    expect(await getDataGeneration()).toBe(3);
  });

  it("imports an old file, exports it as schema 4 and round-trips it again unchanged", async () => {
    const legacy = parseBackup(legacyText());
    if (!legacy.ok) throw new Error(legacy.errors.join(" "));
    await restoreBackup(legacy.data);
    const first = await exportData();
    const reparsed = parseBackup(serializeBackup(first));
    if (!reparsed.ok) throw new Error(reparsed.errors.join(" "));
    expect(reparsed.data).toEqual(first.data);
    await restoreBackup(reparsed.data);
    expect((await exportData()).data).toEqual(first.data);
    expect(first.data.sets.map(withoutTrainingId))
      .toEqual(expect.arrayContaining(legacyFile().data.sets));
  });

  it("opens one readonly transaction over exactly the five export tables", async () => {
    const transaction = vi.spyOn(db, "transaction");
    await exportData();
    expect(transaction).toHaveBeenCalledExactlyOnceWith(
      "r", [db.weightEntries, db.exercises, db.trainings, db.sets, db.settings], expect.any(Function),
    );
  });

  it("reads one snapshot while another connection replaces the tables", async () => {
    await restoreBackup(validFile().data);
    const before = (await exportData()).data;
    const other = new FitDatabase();
    await other.open();
    let write: Promise<unknown> | undefined;
    const readWeights = db.weightEntries.toArray.bind(db.weightEntries);
    vi.spyOn(db.weightEntries, "toArray").mockImplementationOnce(() => readWeights().then((entries) => {
      write = other.transaction("rw", [other.weightEntries, other.exercises, other.trainings, other.sets, other.settings], async () => {
        await other.weightEntries.clear();
        await other.exercises.clear();
        await other.trainings.clear();
        await other.sets.clear();
        await other.settings.clear();
      });
      return entries;
    }));
    try {
      expect((await exportData()).data).toEqual(before);
      await write;
      expect((await exportData()).data).toEqual({ weightEntries: [], exercises: [], trainings: [], sets: [], settings: [] });
    } finally {
      other.close();
    }
  });

  it("does not write during successful or rejected parsing", async () => {
    await restoreBackup(validFile().data);
    const before = await snapshot();
    expect(parseBackup(serializeBackup(validFile())).ok).toBe(true);
    expect(parseBackup(invalidFile((file) => { file.data.sets[0].reps = 0; })).ok).toBe(false);
    expect(await snapshot()).toEqual(before);
  });

  it.each(["after clear", "after first bulkAdd", "at generation bump"])("rolls back every table and meta on failure %s", async (stage) => {
    await restoreBackup(validFile().data);
    const before = await snapshot();
    const replacement = validFile().data;
    replacement.weightEntries[0].weightKg = 77.7;
    replacement.settings = [];
    const failure = new Error("Injected storage failure");
    const clear = vi.spyOn(db.weightEntries, "clear");
    const add = vi.spyOn(db.weightEntries, "bulkAdd");
    if (stage === "after clear") vi.spyOn(db.exercises, "clear").mockRejectedValueOnce(failure);
    if (stage === "after first bulkAdd") vi.spyOn(db.exercises, "bulkAdd").mockRejectedValueOnce(failure);
    if (stage === "at generation bump") vi.spyOn(db.meta, "put").mockRejectedValueOnce(failure);

    await expect(restoreBackup(replacement)).rejects.toThrow(failure.message);
    expect(clear).toHaveBeenCalledOnce();
    if (stage !== "after clear") expect(add).toHaveBeenCalledOnce();
    expect(await snapshot()).toEqual(before);
  });

  it("wipes all data and settings, preserving meta and increasing the generation", async () => {
    await restoreBackup(validFile().data);
    expect(await getDataGeneration()).toBe(1);
    const add = vi.spyOn(db.weightEntries, "bulkAdd");
    await wipeAllData();
    expect((await exportData()).data).toEqual({ weightEntries: [], exercises: [], trainings: [], sets: [], settings: [] });
    expect(await db.meta.toArray()).toEqual([{ key: "dataGeneration", value: 2 }]);
    expect(add).not.toHaveBeenCalled();
  });

  it("rolls back a failed wipe, including settings and meta", async () => {
    await restoreBackup(validFile().data);
    const before = await snapshot();
    vi.spyOn(db.settings, "clear").mockRejectedValueOnce(new Error("Cannot clear settings"));
    await expect(wipeAllData()).rejects.toThrow("Cannot clear settings");
    expect(await snapshot()).toEqual(before);
  });

  it("replaces rather than merges tables and removes settings absent from the backup", async () => {
    await restoreBackup(validFile().data);
    const replacement = validFile().data;
    replacement.weightEntries = [];
    replacement.trainings = [];
    replacement.sets = [];
    replacement.exercises = [];
    replacement.settings = [{ key: "goalWeightKg", value: null }];
    await restoreBackup(replacement);
    expect((await exportData()).data).toEqual(replacement);
    expect(await getDataGeneration()).toBe(2);
  });

  it("refuses a pending weight undo after restore even when its id and date are vacant", async () => {
    await restoreBackup(validFile().data);
    const undo = await deleteWeightEntry("weight");
    if (!undo) throw new Error("Expected a pending undo.");
    const replacement = validFile().data;
    replacement.weightEntries = [];
    await restoreBackup(replacement);
    expect(await restoreWeightEntry(undo)).toBe(false);
    expect(await db.weightEntries.count()).toBe(0);
  });
});
