import { describe, expect, it } from "vitest";
import type { TExercise, TSet, TWeightEntry } from "../lib/db";
import {
  countActiveDaysThisWeek,
  getDailyBest,
  getExerciseProgress,
  getLoads,
  getMonthWeightSummary,
  getProgressLoad,
  getWeightSummary,
  groupSetsByDay,
  withChangeFromPrevious,
} from "../lib/stats";

const weight = (date: string, weightKg: number): TWeightEntry => ({
  id: date,
  date,
  weightKg,
  note: null,
  createdAt: `${date}T07:00:00.000Z`,
  updatedAt: `${date}T07:00:00.000Z`,
});

const set = (
  date: string,
  values: Partial<Pick<TSet, "reps" | "weightKg" | "seconds">>,
  time = "07:00",
): TSet => ({
  id: `${date}-${time}-${JSON.stringify(values)}`,
  exerciseId: "exercise",
  date,
  reps: values.reps ?? null,
  weightKg: values.weightKg ?? null,
  seconds: values.seconds ?? null,
  note: null,
  createdAt: `${date}T${time}:00.000Z`,
  updatedAt: `${date}T${time}:00.000Z`,
});

const exercise = (overrides: Partial<TExercise>): TExercise => ({
  id: "exercise",
  name: "Goblet squat",
  metric: "reps_weight",
  metricLockedAt: null,
  progressWeightKg: null,
  archivedAt: null,
  createdAt: "2026-08-01T07:00:00.000Z",
  updatedAt: "2026-08-01T07:00:00.000Z",
  ...overrides,
});

describe("weight stats", () => {
  it("summarizes no entries as empty", () => {
    expect(getWeightSummary([], 80)).toEqual({
      latest: null,
      first: null,
      changeSinceFirstKg: null,
      toGoalKg: null,
    });
  });

  it("has no change for a single entry but still a distance to goal", () => {
    const only = weight("2026-10-19", 83.4);

    expect(getWeightSummary([only], 80)).toEqual({
      latest: only,
      first: only,
      changeSinceFirstKg: null,
      toGoalKg: 3.4,
    });
  });

  it("uses date order, not insertion order, and rounds the change", () => {
    const summary = getWeightSummary(
      [weight("2026-10-19", 83.4), weight("2026-08-01", 86), weight("2026-09-01", 84.9)],
      null,
    );

    expect(summary.first?.date).toBe("2026-08-01");
    expect(summary.latest?.date).toBe("2026-10-19");
    expect(summary.changeSinceFirstKg).toBe(-2.6);
    expect(summary.toGoalKg).toBeNull();
  });

  it("summarizes only the entries of the month", () => {
    const entries = [
      weight("2026-09-30", 90),
      weight("2026-10-03", 83.3),
      weight("2026-10-10", 83.6),
      weight("2026-10-14", 83.1),
      weight("2026-11-01", 70),
    ];

    expect(getMonthWeightSummary(entries, "2026-10")).toEqual({
      count: 3,
      averageKg: 83.3,
      minKg: 83.1,
      maxKg: 83.6,
    });
    expect(getMonthWeightSummary(entries, "2026-12")).toEqual({
      count: 0,
      averageKg: null,
      minKg: null,
      maxKg: null,
    });
  });

  it("lists entries newest first with the change from the previous entry", () => {
    const rows = withChangeFromPrevious([
      weight("2026-10-17", 83.5),
      weight("2026-10-14", 83.1),
      weight("2026-10-19", 83.4),
    ]);

    expect(rows.map(({ entry, changeKg }) => [entry.date, changeKg])).toEqual([
      ["2026-10-19", -0.1],
      ["2026-10-17", 0.4],
      ["2026-10-14", null],
    ]);
  });
});

describe("exercise stats", () => {
  it("takes the best reps per day and leaves days without sets out", () => {
    const sets = [
      set("2026-10-15", { reps: 28 }),
      set("2026-10-15", { reps: 24 }, "07:05"),
      set("2026-10-19", { reps: 22 }),
      set("2026-10-19", { reps: 29 }, "07:05"),
    ];

    expect(getDailyBest("reps", sets)).toEqual([
      { date: "2026-10-15", value: 28 },
      { date: "2026-10-19", value: 29 },
    ]);
  });

  it("counts only sets at the selected load for reps_weight", () => {
    const sets = [
      set("2026-10-11", { reps: 14, weightKg: 20 }),
      set("2026-10-18", { reps: 10, weightKg: 24 }),
      set("2026-10-18", { reps: 12, weightKg: 24.0 }, "07:05"),
      set("2026-10-18", { reps: 30, weightKg: 24.01 }, "07:10"),
    ];

    expect(getDailyBest("reps_weight", sets, 24)).toEqual([
      { date: "2026-10-18", value: 12 },
    ]);
    expect(getDailyBest("reps_weight", sets, null)).toEqual([]);
    expect(getLoads(sets)).toEqual([20, 24, 24.01]);
  });

  it("takes the longest hold for time", () => {
    const sets = [
      set("2026-10-17", { seconds: 90 }),
      set("2026-10-17", { seconds: 105 }, "07:05"),
    ];

    expect(getDailyBest("time", sets)).toEqual([{ date: "2026-10-17", value: 105 }]);
  });

  it("defaults the progress load to the latest set and prefers a saved one", () => {
    const sets = [
      set("2026-10-18", { reps: 12, weightKg: 24 }),
      set("2026-10-11", { reps: 14, weightKg: 20 }, "09:00"),
    ];

    expect(getProgressLoad(exercise({}), sets)).toBe(24);
    expect(getProgressLoad(exercise({ progressWeightKg: 20 }), sets)).toBe(20);
    expect(getProgressLoad(exercise({ metric: "reps" }), sets)).toBeNull();
    expect(getProgressLoad(exercise({}), [])).toBeNull();
  });

  it("describes progress from the first to the latest day", () => {
    expect(getExerciseProgress([])).toBeNull();
    expect(
      getExerciseProgress([
        { date: "2026-08-03", value: 18 },
        { date: "2026-10-15", value: 30 },
        { date: "2026-10-19", value: 29 },
      ]),
    ).toEqual({
      first: { date: "2026-08-03", value: 18 },
      latest: { date: "2026-10-19", value: 29 },
      best: { date: "2026-10-15", value: 30 },
      changeSinceFirst: 11,
    });
  });

  it("groups sets by day, newest day first, sets in logged order", () => {
    const days = groupSetsByDay([
      set("2026-10-19", { reps: 25 }, "07:15"),
      set("2026-10-15", { reps: 28 }),
      set("2026-10-19", { reps: 29 }, "07:12"),
    ]);

    expect(days.map((day) => [day.date, day.sets.map((item) => item.reps), day.totalReps])).toEqual([
      ["2026-10-19", [29, 25], 54],
      ["2026-10-15", [28], 28],
    ]);
    expect(days[0].totalSeconds).toBeNull();
  });

  it("counts distinct active days from Monday to Sunday of this week", () => {
    const sets = [
      set("2026-10-12", { reps: 1 }),
      set("2026-10-13", { reps: 1 }),
      set("2026-10-13", { reps: 1 }, "08:00"),
      set("2026-10-18", { reps: 1 }),
      set("2026-10-19", { reps: 1 }),
    ];

    expect(countActiveDaysThisWeek(sets, "2026-10-18")).toBe(3);
    expect(countActiveDaysThisWeek(sets, "2026-10-19")).toBe(1);
  });
});
