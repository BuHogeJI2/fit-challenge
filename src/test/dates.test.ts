import { describe, expect, it } from "vitest";
import {
  addDays,
  differenceInDays,
  getDateKey,
  getMonthKey,
  getMonthRange,
  getWeekStart,
  parseDateKey,
  shiftMonth,
} from "../lib/dates";

describe("date keys", () => {
  it("uses local calendar fields at both ends of the day", () => {
    expect(getDateKey(new Date(2026, 9, 19, 0, 5))).toBe("2026-10-19");
    expect(getDateKey(new Date(2026, 9, 19, 23, 55))).toBe("2026-10-19");
  });

  it("pads years below 100 without treating them as the 1900s", () => {
    const date = new Date(0);
    date.setFullYear(9, 0, 2);
    expect(getDateKey(date)).toBe("0009-01-02");
    expect(parseDateKey("0009-01-02")).toEqual({ year: 9, month: 1, day: 2 });
  });

  it.each(["2024-02-29", "2000-02-29", "0001-01-01", "9999-12-31"])(
    "accepts the real date %s",
    (value) => {
      expect(parseDateKey(value)).not.toBeNull();
    },
  );

  it.each([
    "2026-02-29",
    "1900-02-29",
    "2100-02-29",
    "2026-04-31",
    "2026-00-01",
    "2026-13-01",
    "2026-10-00",
    "2026-10-32",
    "0000-01-01",
    "2026-2-03",
    "2026-10-3",
    " 2026-10-19",
    "2026-10-19T00:00:00Z",
    "",
  ])("rejects the invalid date key %j", (value) => {
    expect(parseDateKey(value)).toBeNull();
  });

  it("accepts a calendar date skipped by a local timezone", () => {
    expect(parseDateKey("2011-12-30")).toEqual({ year: 2011, month: 12, day: 30 });
    expect(addDays("2011-12-29", 1)).toBe("2011-12-30");
  });

  it("rejects invalid Date objects and out-of-range years", () => {
    expect(() => getDateKey(new Date(NaN))).toThrow(RangeError);
    const date = new Date(0);
    date.setFullYear(10000);
    expect(() => getDateKey(date)).toThrow(RangeError);
  });
});

describe("calendar arithmetic", () => {
  it("counts calendar days through both daylight-saving transitions", () => {
    expect(differenceInDays("2026-03-09", "2026-03-07")).toBe(2);
    expect(differenceInDays("2026-11-02", "2026-10-31")).toBe(2);
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09");
    expect(addDays("2026-10-31", 2)).toBe("2026-11-02");
  });

  it("keeps the signed order and handles leap days and early years", () => {
    expect(differenceInDays("2024-03-01", "2024-02-28")).toBe(2);
    expect(differenceInDays("2024-02-28", "2024-03-01")).toBe(-2);
    expect(differenceInDays("2026-10-19", "2026-10-19")).toBe(0);
    expect(differenceInDays("0100-01-01", "0099-12-31")).toBe(1);
  });

  it("adds zero and negative days across month and year boundaries", () => {
    expect(addDays("2026-10-19", 0)).toBe("2026-10-19");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("0099-12-31", 1)).toBe("0100-01-01");
  });

  it("returns Monday for every day of a week", () => {
    for (let day = 19; day <= 25; day += 1) {
      expect(getWeekStart(`2026-10-${day}`)).toBe("2026-10-19");
    }
    expect(getWeekStart("2026-01-01")).toBe("2025-12-29");
  });

  it("rejects invalid dates, fractional offsets, and overflow", () => {
    expect(() => differenceInDays("2026-02-30", "2026-03-01")).toThrow(RangeError);
    expect(() => addDays("2026-02-30", 1)).toThrow(RangeError);
    expect(() => addDays("2026-10-19", 0.5)).toThrow(RangeError);
    expect(() => addDays("2026-10-19", Infinity)).toThrow(RangeError);
    expect(() => addDays("0001-01-01", -1)).toThrow(RangeError);
    expect(() => addDays("9999-12-31", 1)).toThrow(RangeError);
    expect(() => getWeekStart("not-a-date")).toThrow(RangeError);
  });
});

describe("month ranges", () => {
  it("extracts the month only from a valid date", () => {
    expect(getMonthKey("2026-10-19")).toBe("2026-10");
    expect(() => getMonthKey("2026-02-30")).toThrow(RangeError);
  });

  it("uses inclusive boundaries and the correct leap-year rule", () => {
    expect(getMonthRange("2024-02")).toEqual({ start: "2024-02-01", end: "2024-02-29" });
    expect(getMonthRange("2100-02")).toEqual({ start: "2100-02-01", end: "2100-02-28" });
    expect(getMonthRange("2026-04")).toEqual({ start: "2026-04-01", end: "2026-04-30" });
    expect(getMonthRange("2026-12")).toEqual({ start: "2026-12-01", end: "2026-12-31" });
  });

  it("shifts months through year boundaries in either direction", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-10", -24)).toBe("2024-10");
    expect(shiftMonth("2026-10", 0)).toBe("2026-10");
    expect(shiftMonth("0001-01", 1)).toBe("0001-02");
  });

  it("rejects malformed months and invalid navigation", () => {
    for (const month of ["2026-00", "2026-13", "2026-1", "0000-01", "2026-10-01"]) {
      expect(() => getMonthRange(month)).toThrow(RangeError);
      expect(() => shiftMonth(month, 1)).toThrow(RangeError);
    }
    expect(() => shiftMonth("2026-10", 0.5)).toThrow(RangeError);
    expect(() => shiftMonth("2026-10", NaN)).toThrow(RangeError);
    expect(() => shiftMonth("0001-01", -1)).toThrow(RangeError);
    expect(() => shiftMonth("9999-12", 1)).toThrow(RangeError);
  });
});
