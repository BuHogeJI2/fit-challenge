import { describe, expect, it } from "vitest";
import {
  getMonthAxisLabels,
  getRangeAxisLabels,
  getWeekAxisLabels,
} from "../components/charts/axis-labels";
import {
  formatDateRange,
  formatDayOfMonth,
  formatLongDate,
  formatMonthLabel,
  formatRelativeDate,
  formatShortDate,
  formatWeekdayShort,
} from "../lib/dates";
import { formatSignedWeightValue } from "../lib/numbers";

describe("date display formats", () => {
  it("formats a date key without shifting it by time zone", () => {
    expect(formatShortDate("2026-10-19")).toBe("Oct 19");
    expect(formatLongDate("2026-10-19")).toBe("Monday, Oct 19");
    expect(formatWeekdayShort("2026-10-19")).toBe("Mon");
    expect(formatDayOfMonth("2026-10-09")).toBe("9");
  });

  it("adds the year to a month label only outside the current year", () => {
    expect(formatMonthLabel("2026-10", "2026-12-01")).toBe("October");
    expect(formatMonthLabel("2025-12", "2026-01-02")).toBe("December 2025");
  });

  it("shortens a range inside one month and adds the year outside the current one", () => {
    expect(formatDateRange("2026-10-12", "2026-10-18", "2026-10-19")).toBe("Oct 12 – 18");
    expect(formatDateRange("2026-09-28", "2026-10-04", "2026-10-19")).toBe("Sep 28 – Oct 4");
    expect(formatDateRange("2025-10-06", "2025-10-12", "2026-10-19")).toBe("Oct 6 – 12, 2025");
    expect(formatDateRange("2025-12-29", "2026-01-04", "2026-10-19")).toBe("Dec 29, 2025 – Jan 4");
  });

  it("names today and yesterday", () => {
    expect(formatRelativeDate("2026-10-19", "2026-10-19")).toBe("today");
    expect(formatRelativeDate("2026-10-18", "2026-10-19")).toBe("yesterday");
    expect(formatRelativeDate("2026-10-14", "2026-10-19")).toBe("Oct 14");
    expect(formatRelativeDate("2025-10-14", "2026-10-19")).toBe("Oct 14, 2025");
  });
});

describe("signed weight format", () => {
  it("uses a real minus sign and hides the sign of zero", () => {
    expect(formatSignedWeightValue(-2.6)).toBe("−2.6");
    expect(formatSignedWeightValue(0.4)).toBe("+0.4");
    expect(formatSignedWeightValue(-0.04)).toBe("0.0");
  });
});

describe("weight chart axis labels", () => {
  it("labels weekly days that exist in the month", () => {
    expect(getMonthAxisLabels("2026-02").map((label) => label.label)).toEqual([
      "1",
      "8",
      "15",
      "22",
    ]);
    expect(getMonthAxisLabels("2026-10").at(-1)).toEqual({ date: "2026-10-29", label: "29" });
  });

  it("labels month starts inside a range and thins long ranges", () => {
    expect(getRangeAxisLabels("2026-08-01", "2026-10-19")).toEqual([
      { date: "2026-09-01", label: "Sep" },
      { date: "2026-10-01", label: "Oct" },
    ]);
    expect(getRangeAxisLabels("2026-10-03", "2026-10-19")).toEqual([
      { date: "2026-10-03", label: "Oct" },
    ]);
    expect(getRangeAxisLabels("2024-01-01", "2026-12-31").length).toBeLessThanOrEqual(6);
    expect(getRangeAxisLabels("2025-11-10", "2026-02-10").map((label) => label.label)).toEqual([
      "Dec 2025",
      "Jan 2026",
      "Feb",
    ]);
  });

  it("labels every third week under the middle of the week by its Monday", () => {
    const weekStarts = ["2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24", "2026-08-31"];

    expect(getWeekAxisLabels(weekStarts)).toEqual([
      { date: "2026-08-06", label: "Aug 3" },
      { date: "2026-08-27", label: "Aug 24" },
    ]);
  });
});
