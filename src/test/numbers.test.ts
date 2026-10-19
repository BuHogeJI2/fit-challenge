import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatKg,
  formatReps,
  formatWeightValue,
  parseDecimal,
} from "../lib/numbers";

describe("parseDecimal", () => {
  it.each([
    ["83.4", 83.4],
    ["83,4", 83.4],
    [" 83,4 ", 83.4],
    ["83", 83],
    [".5", 0.5],
    [",5", 0.5],
    ["-2,5", -2.5],
    ["+2.5", 2.5],
    ["0", 0],
    ["-0", 0],
  ])("parses %j as %s", (input, expected) => {
    expect(parseDecimal(input)).toBe(expected);
  });

  it.each([
    "",
    " ",
    ".",
    ",",
    "83.",
    "83,",
    "83kg",
    "83.4.5",
    "1,234.5",
    "1 234,5",
    "1_234",
    "1e2",
    "0x10",
    "Infinity",
    "NaN",
    "9".repeat(400),
  ])("rejects incomplete, grouped, or non-decimal input %j", (input) => {
    expect(parseDecimal(input)).toBeNull();
  });
});

describe("weight formatting", () => {
  it("uses one decimal with or without the unit", () => {
    expect(formatWeightValue(83)).toBe("83.0");
    expect(formatWeightValue(83.45)).toBe("83.5");
    expect(formatWeightValue(1234.5)).toBe("1234.5");
    expect(formatKg(83.4)).toBe("83.4 kg");
  });

  it("normalizes rounded negative zero without losing negative changes", () => {
    expect(formatWeightValue(-0)).toBe("0.0");
    expect(formatWeightValue(-0.01)).toBe("0.0");
    expect(formatKg(-2.6)).toBe("-2.6 kg");
  });

  it.each([NaN, Infinity, -Infinity])("rejects non-finite weight %s", (value) => {
    expect(() => formatWeightValue(value)).toThrow(RangeError);
    expect(() => formatKg(value)).toThrow(RangeError);
  });
});

describe("set formatting", () => {
  it("formats reps with the correct unit", () => {
    expect(formatReps(0)).toBe("0 reps");
    expect(formatReps(1)).toBe("1 rep");
    expect(formatReps(24)).toBe("24 reps");
    expect(formatReps(1234)).toBe("1,234 reps");
  });

  it("formats seconds as minutes and two-digit seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(59)).toBe("0:59");
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(105)).toBe("1:45");
    expect(formatDuration(3605)).toBe("60:05");
  });

  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid counts %s",
    (value) => {
      expect(() => formatReps(value)).toThrow(RangeError);
      expect(() => formatDuration(value)).toThrow(RangeError);
    },
  );
});
