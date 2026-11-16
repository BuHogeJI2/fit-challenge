import Dexie from "dexie";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DATABASE_NAME,
  db,
  FitDatabase,
  getDatabaseNotice,
  groupLegacySets,
  subscribeDatabaseNotice,
  type TGroupedLegacySets,
} from "../lib/db";

const withoutTrainingId = <T extends { trainingId?: string }>(set: T) => {
  const copy: Partial<T> = { ...set };
  delete copy.trainingId;
  return copy as Omit<T, "trainingId">;
};

type TGroup = typeof groupLegacySets;

const injection = vi.hoisted(() => ({
  change: null as null | ((result: TGroupedLegacySets<{ date: string; createdAt: string; updatedAt: string }>) => void),
  fail: false,
}));

vi.mock("../lib/db/legacy-trainings", async (importOriginal) => {
  const original = await importOriginal<{ groupLegacySets: TGroup }>();
  return {
    ...original,
    groupLegacySets: ((sets, createId) => {
      if (injection.fail) throw new Error("Injected conversion failure");
      const result = original.groupLegacySets(sets, createId);
      injection.change?.(result);
      return result;
    }) as TGroup,
  };
});

const V1_STORES = {
  weightEntries: "id, &date",
  exercises: "id",
  sets: "id, exerciseId, date, [exerciseId+date]",
  settings: "key",
  meta: "key",
};

const at = (time: string) => `${time}.000Z`;

const exercise = (id: string, metric: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: id,
  metric,
  metricLockedAt: at("2024-01-02T08:00:00"),
  progressWeightKg: null,
  archivedAt: null,
  createdAt: at("2024-01-01T08:00:00"),
  updatedAt: at("2024-01-02T08:00:00"),
  ...extra,
});

const set = (id: string, exerciseId: string, date: string, values: Record<string, unknown>, time: string) => ({
  id,
  exerciseId,
  date,
  reps: null,
  weightKg: null,
  seconds: null,
  note: null,
  createdAt: at(`${date}T${time}`),
  updatedAt: at(`${date}T${time}`),
  ...values,
});

const legacyRows = (version: 1 | 2) => ({
  weightEntries: [
    { id: "w1", date: "2023-12-31", weightKg: 84.2, note: "Old year", createdAt: at("2023-12-31T07:00:00"), updatedAt: at("2023-12-31T07:00:00") },
    { id: "w2", date: "2026-10-19", weightKg: 83.4, note: null, createdAt: at("2026-10-19T07:00:00"), updatedAt: at("2026-10-19T07:00:00") },
  ],
  exercises: [
    exercise("squat", "reps_weight", { progressWeightKg: 22.5 }),
    exercise("boxing", "session"),
    exercise("plank", "time", { archivedAt: at("2025-05-01T08:00:00") }),
    exercise("unused", "reps", { metricLockedAt: null }),
  ].map((item) => (version === 2 ? { ...item, progressView: item.id === "squat" ? "best" : "total" } : item)),
  sets: [
    set("s1", "squat", "2026-10-19", { reps: 10, weightKg: 22.5, note: "Light" }, "07:10:00"),
    set("s2", "squat", "2026-10-19", { reps: 8, weightKg: 30 }, "07:20:00"),
    set("s3", "boxing", "2026-10-19", {}, "18:00:00"),
    set("s4", "boxing", "2026-10-19", { note: "Second class" }, "20:00:00"),
    set("s5", "plank", "2025-04-30", { seconds: 95 }, "06:00:00"),
    set("s6", "gone", "2023-12-31", { reps: 3, legacyFlag: true }, "09:00:00"),
  ].map((item) => (item.id === "s2" ? { ...item, updatedAt: at("2026-10-20T10:00:00") } : item)),
  settings: [
    { key: "goalWeightKg", value: 80 },
    { key: "lastExportAt", value: at("2026-10-01T10:00:00") },
  ],
  meta: [{ key: "dataGeneration", value: 4 }],
});

type TRows = ReturnType<typeof legacyRows>;

let databaseCount = 0;
const names: string[] = [];

const createLegacyDatabase = async (version: 1 | 2) => {
  const name = `fit-migration-${++databaseCount}`;
  names.push(name);
  const legacy = new Dexie(name);
  legacy.version(1).stores(V1_STORES);
  if (version === 2) legacy.version(2).stores({});
  await legacy.open();
  const rows = legacyRows(version);
  await legacy.transaction("rw", legacy.tables, async () => {
    for (const [table, records] of Object.entries(rows)) {
      await legacy.table(table).bulkAdd(records);
    }
  });
  legacy.close();
  return { name, rows };
};

const readTables = async (database: Dexie) =>
  Object.fromEntries(
    await Promise.all(
      database.tables.map(async (table) => [table.name, await table.toArray()] as const),
    ),
  );

const readRaw = async (name: string) => {
  const raw = new Dexie(name);
  await raw.open();
  try {
    return { version: raw.verno, tables: await readTables(raw) };
  } finally {
    raw.close();
  }
};

const openCurrent = async (name: string) => {
  const current = new FitDatabase(name);
  await current.open();
  return current;
};

const sortById = <T extends { id: string }>(items: T[]) => [...items].sort((a, b) => a.id.localeCompare(b.id));

const expectMigrated = async (current: FitDatabase, rows: TRows) => {
  const sets = await current.sets.toArray();
  const trainings = await current.trainings.toArray();

  expect(sortById(sets.map(withoutTrainingId))).toEqual(sortById(rows.sets));
  const byId = new Map(trainings.map((training) => [training.id, training]));
  for (const item of sets) {
    expect(byId.get(item.trainingId)?.date).toBe(item.date);
  }
  expect(trainings.map((training) => training.date).sort()).toEqual(["2023-12-31", "2025-04-30", "2026-10-19"]);
  expect(trainings.find((training) => training.date === "2026-10-19")).toMatchObject({
    name: null,
    note: null,
    createdAt: at("2026-10-19T07:10:00"),
    updatedAt: at("2026-10-20T10:00:00"),
  });
  expect(await current.weightEntries.toArray()).toEqual(rows.weightEntries);
  expect(await current.settings.toArray()).toEqual(rows.settings);
  expect(await current.meta.toArray()).toEqual(rows.meta);
};

afterEach(async () => {
  injection.change = null;
  injection.fail = false;
  vi.restoreAllMocks();
  await Promise.all(names.splice(0).map((name) => Dexie.delete(name)));
});

describe("training migration", () => {
  it("links every version 2 set to one training per date and leaves other tables unchanged", async () => {
    const { name, rows } = await createLegacyDatabase(2);
    const current = await openCurrent(name);
    try {
      expect(current.verno).toBe(3);
      await expectMigrated(current, rows);
      expect(await current.exercises.toArray()).toEqual(sortById(rows.exercises));
    } finally {
      current.close();
    }
  });

  it("upgrades version 1 with the earlier progress view default, then links the sets", async () => {
    const { name, rows } = await createLegacyDatabase(1);
    const current = await openCurrent(name);
    try {
      await expectMigrated(current, rows);
      expect(await current.exercises.toArray()).toEqual(
        sortById(rows.exercises.map((item) => ({ ...item, progressView: "total" }))),
      );
    } finally {
      current.close();
    }
  });

  it("indexes sets by training", async () => {
    const { name } = await createLegacyDatabase(2);
    const current = await openCurrent(name);
    try {
      const [training] = await current.trainings.where("date").equals("2026-10-19").toArray();
      const ids = (await current.sets.where("trainingId").equals(training.id).toArray()).map((item) => item.id);
      expect(ids.sort()).toEqual(["s1", "s2", "s3", "s4"]);
    } finally {
      current.close();
    }
  });

  it.each([
    ["before any write", () => { injection.fail = true; }],
    ["after trainings and links were written", () => {
      injection.change = (result) => {
        result.sets[0] = { ...result.sets[0], trainingId: "not-a-training" };
      };
    }],
  ])("keeps the old database unchanged when the upgrade fails %s, and a retry succeeds", async (_stage, inject) => {
    const { name, rows } = await createLegacyDatabase(2);
    const before = await readRaw(name);
    inject();

    const failing = new FitDatabase(name);
    await expect(failing.open()).rejects.toThrow();
    failing.close();

    const after = await readRaw(name);
    expect(after).toEqual(before);
    expect(after.version).toBe(2);
    expect(Object.keys(after.tables)).not.toContain("trainings");

    injection.change = null;
    injection.fail = false;
    const retried = await openCurrent(name);
    try {
      await expectMigrated(retried, rows);
    } finally {
      retried.close();
    }
  });

  it("creates an empty current database without trainings", async () => {
    const name = `fit-migration-${++databaseCount}`;
    names.push(name);
    const current = await openCurrent(name);
    try {
      expect(current.verno).toBe(3);
      expect(await current.trainings.count()).toBe(0);
    } finally {
      current.close();
    }
  });
});

describe("legacy grouping", () => {
  it("keeps sets unchanged apart from the training link", () => {
    const sets = legacyRows(2).sets;
    let next = 0;
    const result = groupLegacySets(sets, () => `t${++next}`);

    expect(result.sets.map(withoutTrainingId)).toEqual(sets);
    expect(result.sets.map((item) => item.trainingId)).toEqual(["t1", "t1", "t1", "t1", "t2", "t3"]);
    expect(result.trainings.map((training) => [training.id, training.date])).toEqual([
      ["t1", "2026-10-19"], ["t2", "2025-04-30"], ["t3", "2023-12-31"],
    ]);
    expect(groupLegacySets([], () => "unused")).toEqual({ sets: [], trainings: [] });
  });
});

describe("database notices", () => {
  it("forgets a blocked upgrade once the database opens", async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDatabaseNotice(listener);
    try {
      db.close();
      db.on("blocked").fire({ oldVersion: 20, newVersion: 30 } as IDBVersionChangeEvent);
      expect(listener).toHaveBeenCalledWith("upgrade_blocked");
      expect(getDatabaseNotice()).toBe("upgrade_blocked");

      await db.open();
      expect(getDatabaseNotice()).toBeNull();
    } finally {
      unsubscribe();
      db.close();
      await Dexie.delete(DATABASE_NAME);
    }
  });

  it("tells the screens when another window upgrades the database", async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDatabaseNotice(listener);
    await db.open();
    const newer = new Dexie(DATABASE_NAME);
    newer.version(4).stores({ ...V1_STORES, sets: "id, exerciseId, trainingId, date, [exerciseId+date]", trainings: "id, date" });
    try {
      await newer.open();
      expect(listener).toHaveBeenCalledWith("updated_elsewhere");
      expect(getDatabaseNotice()).toBe("updated_elsewhere");
      expect(db.isOpen()).toBe(false);
    } finally {
      unsubscribe();
      newer.close();
      await Dexie.delete(DATABASE_NAME);
    }
  });
});
