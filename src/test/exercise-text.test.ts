import { describe, expect, it } from "vitest";
import type { TMetric, TProgressView } from "../lib/db";
import { formatDuration, formatLoadValue, formatWeightValue, parseDuration } from "../lib/numbers";
import {
  describeExerciseProgress,
  formatProgressValue,
  formatSetValues,
  getExerciseProgress,
} from "../lib/stats";
import type { TDailyValue } from "../lib/stats";

const describeProgress = (
  metric: TMetric,
  days: TDailyValue[],
  loadKg: number | null = null,
  view: TProgressView = "best",
) =>
  describeExerciseProgress({
    metric,
    view,
    progress: getExerciseProgress(days),
    loadKg,
    todayKey: "2026-10-19",
  });

describe("duration input", () => {
  it.each([
    ["105", 105],
    ["1:45", 105],
    ["0:05", 5],
    ["0:00", 0],
    ["0", 0],
    ["60:05", 3605],
    ["90:00", 5400],
    [" 1:45 ", 105],
    ["001:05", 65],
    ["0005", 5],
    ["9007199254740991", Number.MAX_SAFE_INTEGER],
    ["150119987579016:31", Number.MAX_SAFE_INTEGER],
  ])("parses %j as %s seconds", (text, expected) => {
    expect(parseDuration(text)).toBe(expected);
  });

  it.each([
    "", " ", "1:", ":45", "1:5", "1:60", "1:99", "1:005", "1:30:00",
    "1.5", "1,5", "-1", "+1", "-1:30", "1.5:00", "1: 05", "1e2", "0x10",
    "105s", "Infinity", "NaN", "9007199254740992", "150119987579016:32",
    `${"9".repeat(400)}:00`,
  ])("rejects invalid or unsafe duration %j", (text) => {
    expect(parseDuration(text)).toBeNull();
  });

  it("round-trips the largest safe duration through m:ss formatting", () => {
    expect(parseDuration(formatDuration(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe("exercise values", () => {
  it("formats whole, tenth and hundredth loads without trailing zeros", () => {
    expect(formatLoadValue(24)).toBe("24");
    expect(formatLoadValue(22.5)).toBe("22.5");
    expect(formatLoadValue(22.55)).toBe("22.55");
    expect(formatLoadValue(1234.56)).toBe("1234.56");
    expect(formatLoadValue(-0)).toBe("0");
    expect(formatWeightValue(24)).toBe("24.0");
    expect(() => formatLoadValue(Infinity)).toThrow(RangeError);
  });

  it("formats each set metric with the right units and precision", () => {
    expect(formatSetValues("reps", { reps: 29, weightKg: null, seconds: null })).toBe("29 reps");
    expect(formatSetValues("reps", { reps: 1, weightKg: null, seconds: null })).toBe("1 rep");
    expect(formatSetValues("reps_weight", { reps: 12, weightKg: 24, seconds: null })).toBe("12 × 24 kg");
    expect(formatSetValues("reps_weight", { reps: 12, weightKg: 22.5, seconds: null })).toBe("12 × 22.5 kg");
    expect(formatSetValues("reps_weight", { reps: 12, weightKg: 22.55, seconds: null })).toBe("12 × 22.55 kg");
    expect(formatSetValues("time", { reps: null, weightKg: null, seconds: 105 })).toBe("1:45");
  });

  it("formats progress values as reps or duration and rejects a missing required value", () => {
    expect(formatProgressValue("reps", 29)).toBe("29 reps");
    expect(formatProgressValue("reps_weight", 12)).toBe("12 reps");
    expect(formatProgressValue("time", 105)).toBe("1:45");
    expect(() => formatSetValues("time", { reps: null, weightKg: null, seconds: null })).toThrow(RangeError);
  });
});

describe("exercise progress text", () => {
  it.each<TMetric>(["reps", "reps_weight", "time"])("describes empty %s progress", (metric) => {
    expect(describeProgress(metric, [])).toBe("No sets yet.");
  });

  it("describes improvement when the latest day is also the record", () => {
    expect(describeProgress("reps", [
      { date: "2026-08-03", value: 18 },
      { date: "2026-10-19", value: 29 },
    ])).toBe("Best set 29 reps, up 11 since Aug 3.");
  });

  it("keeps the latest comparison separate from a higher historical record", () => {
    expect(describeProgress("reps", [
      { date: "2026-08-03", value: 18 },
      { date: "2026-10-12", value: 31 },
      { date: "2026-10-19", value: 27 },
    ])).toBe("Latest best set 27 reps, up 9 since Aug 3. Record 31 on Oct 12.");
  });

  it("describes decline from the first day without calling it an all-time best", () => {
    expect(describeProgress("reps", [
      { date: "2026-08-03", value: 29 },
      { date: "2026-10-19", value: 27 },
    ])).toBe("Latest best set 27 reps, down 2 since Aug 3. Record 29 on Aug 3.");
  });

  it("describes unchanged progress and a single day without an invented change", () => {
    expect(describeProgress("reps", [
      { date: "2026-08-03", value: 29 },
      { date: "2026-10-19", value: 29 },
    ])).toBe("Best set 29 reps, same as Aug 3.");
    expect(describeProgress("reps", [{ date: "2026-10-19", value: 29 }]))
      .toBe("Best set 29 reps on Oct 19.");
  });

  it("names the selected load with enough precision", () => {
    expect(describeProgress("reps_weight", [
      { date: "2026-10-01", value: 10 },
      { date: "2026-10-19", value: 12 },
    ], 24)).toBe("12 reps at 24 kg, up 2 since Oct 1.");
    expect(describeProgress("reps_weight", [{ date: "2026-10-19", value: 12 }], 22.55))
      .toBe("12 reps at 22.55 kg on Oct 19.");
  });

  it("distinguishes the latest weighted set from its record at the same load", () => {
    expect(describeProgress("reps_weight", [
      { date: "2026-10-01", value: 12 },
      { date: "2026-10-19", value: 10 },
    ], 24)).toBe("Latest 10 reps at 24 kg, down 2 since Oct 1. Record 12 on Oct 1.");
  });

  it("formats duration improvements and records as m:ss", () => {
    expect(describeProgress("time", [
      { date: "2026-08-05", value: 60 },
      { date: "2026-10-19", value: 105 },
    ])).toBe("Longest hold 1:45, up 0:45 since Aug 5.");
    expect(describeProgress("time", [
      { date: "2026-08-05", value: 105 },
      { date: "2026-10-19", value: 90 },
    ])).toBe("Latest hold 1:30, down 0:15 since Aug 5. Record 1:45 on Aug 5.");
  });

  it("describes day totals for each metric", () => {
    expect(describeProgress("reps", [
      { date: "2026-10-15", value: 10 },
      { date: "2026-10-19", value: 30 },
    ], null, "total")).toBe("Best day 30 reps, up 20 since Oct 15.");
    expect(describeProgress("reps", [
      { date: "2026-10-15", value: 30 },
      { date: "2026-10-19", value: 20 },
    ], null, "total")).toBe("Latest day 20 reps, down 10 since Oct 15. Record 30 on Oct 15.");
    expect(describeProgress("reps_weight", [{ date: "2026-10-19", value: 36 }], 24, "total"))
      .toBe("Best day 36 reps at 24 kg on Oct 19.");
    expect(describeProgress("time", [
      { date: "2026-10-15", value: 90 },
      { date: "2026-10-19", value: 180 },
    ], null, "total")).toBe("Best day 3:00, up 1:30 since Oct 15.");
  });

  it("includes the year when a comparison date is outside the current year", () => {
    expect(describeProgress("reps", [
      { date: "2025-08-03", value: 18 },
      { date: "2026-10-19", value: 29 },
    ])).toBe("Best set 29 reps, up 11 since Aug 3, 2025.");
  });
});
