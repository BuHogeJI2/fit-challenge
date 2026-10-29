import { describe, expect, it } from "vitest";
import {
  buildLinePoints,
  createBandScale,
  createDateScale,
  createValueScale,
  niceTicks,
} from "../lib/charts";

describe("band scale", () => {
  it("gives every day or week one slot and centers dates in it", () => {
    const days = createBandScale({ startKey: "2026-10-01", endKey: "2026-10-10", stepDays: 1, x0: 0, x1: 100 });
    expect(days.bandwidth).toBe(10);
    expect(days.center("2026-10-01")).toBe(5);
    expect(days.center("2026-10-10")).toBe(95);

    const weeks = createBandScale({ startKey: "2026-10-05", endKey: "2026-10-26", stepDays: 7, x0: 0, x1: 100 });
    expect(weeks.bandwidth).toBe(25);
    expect(weeks.center("2026-10-12")).toBe(37.5);
    expect(weeks.center("2026-10-15")).toBeCloseTo(48.21, 2);
  });

  it("uses one full-width slot for a single date and rejects bad input", () => {
    expect(createBandScale({ startKey: "2026-10-19", endKey: "2026-10-19", stepDays: 1, x0: 0, x1: 100 }))
      .toMatchObject({ bandwidth: 100 });
    expect(() => createBandScale({ startKey: "2026-10-20", endKey: "2026-10-19", stepDays: 1, x0: 0, x1: 100 })).toThrow(RangeError);
    expect(() => createBandScale({ startKey: "2026-10-19", endKey: "2026-10-19", stepDays: 0, x0: 0, x1: 100 })).toThrow(RangeError);
    expect(() => createBandScale({ startKey: "2026-10-19", endKey: "2026-10-19", stepDays: 1, x0: 0, x1: NaN })).toThrow(RangeError);
  });
});

describe("date scale", () => {
  it("uses actual day spacing rather than point positions", () => {
    const scale = createDateScale({ startKey: "2026-10-01", endKey: "2026-10-11", x0: 20, x1: 220 });
    expect(scale("2026-10-01")).toBe(20);
    expect(scale("2026-10-02")).toBe(40);
    expect(scale("2026-10-06")).toBe(120);
    expect(scale("2026-10-11")).toBe(220);
  });

  it("centers a single date and supports a reversed drawing range", () => {
    const single = createDateScale({ startKey: "2026-10-19", endKey: "2026-10-19", x0: 20, x1: 220 });
    expect(single("2026-10-19")).toBe(120);
    const reversed = createDateScale({ startKey: "2026-10-01", endKey: "2026-10-11", x0: 220, x1: 20 });
    expect(reversed("2026-10-06")).toBe(120);
  });

  it("uses calendar days across daylight-saving transitions and leap days", () => {
    const spring = createDateScale({ startKey: "2026-03-07", endKey: "2026-03-09", x0: 0, x1: 100 });
    expect(spring("2026-03-08")).toBe(50);
    const autumn = createDateScale({ startKey: "2026-10-31", endKey: "2026-11-02", x0: 0, x1: 100 });
    expect(autumn("2026-11-01")).toBe(50);
    const leap = createDateScale({ startKey: "2024-02-28", endKey: "2024-03-01", x0: 0, x1: 100 });
    expect(leap("2024-02-29")).toBe(50);
  });

  it("rejects invalid or reversed dates and nonfinite drawing coordinates", () => {
    expect(() => createDateScale({ startKey: "2026-02-30", endKey: "2026-03-01", x0: 0, x1: 100 })).toThrow(RangeError);
    expect(() => createDateScale({ startKey: "2026-10-20", endKey: "2026-10-19", x0: 0, x1: 100 })).toThrow(RangeError);
    expect(() => createDateScale({ startKey: "2026-10-19", endKey: "2026-10-19", x0: NaN, x1: 100 })).toThrow(RangeError);
    const single = createDateScale({ startKey: "2026-10-19", endKey: "2026-10-19", x0: 0, x1: 100 });
    expect(() => single("not-a-date")).toThrow(RangeError);
  });
});

describe("value scale", () => {
  it("pads the observed domain and maps it to an inverted SVG range", () => {
    const { min, max, scale } = createValueScale({ values: [80, 84], y0: 200, y1: 20 });
    expect(min).toBeCloseTo(79.6);
    expect(max).toBeCloseTo(84.4);
    expect(scale(min)).toBe(200);
    expect(scale(max)).toBe(20);
    expect(scale(82)).toBeCloseTo(110);
  });

  it.each([[83.4], [83.4, 83.4, 83.4]])("gives a readable domain to flat values %j", (...values) => {
    const { min, max, scale } = createValueScale({ values, y0: 200, y1: 20, minSpan: 1 });
    expect(max - min).toBeCloseTo(1.2);
    expect(min).toBeLessThan(83.4);
    expect(max).toBeGreaterThan(83.4);
    expect(scale(83.4)).toBeCloseTo(110);
  });

  it("respects a larger minimum span for a narrow series", () => {
    const { min, max } = createValueScale({ values: [83.3, 83.4], y0: 100, y1: 0, minSpan: 2 });
    expect(max - min).toBeCloseTo(2.4);
  });

  it("includes goals on either side of the observed values", () => {
    const { min, max, scale } = createValueScale({ values: [83, 84], extra: [80, 90], y0: 200, y1: 20 });
    expect(min).toBeLessThan(80);
    expect(max).toBeGreaterThan(90);
    expect(scale(80)).toBeLessThan(200);
    expect(scale(90)).toBeGreaterThan(20);
  });

  it("has a stable empty fallback without adding fake chart points", () => {
    const empty = createValueScale({ values: [], y0: 100, y1: 0 });
    expect(empty.min).toBeLessThan(empty.max);
    expect(Number.isFinite(empty.scale(0))).toBe(true);
    const goalOnly = createValueScale({ values: [], extra: [80], y0: 100, y1: 0 });
    expect(goalOnly.scale(80)).toBeCloseTo(50);
  });

  it("supports negative values and a constant drawing range", () => {
    const { scale } = createValueScale({ values: [-2, 2], y0: 10, y1: 10 });
    expect(scale(-2)).toBe(10);
    expect(scale(2)).toBe(10);
  });

  it("rejects nonfinite values, nonpositive minimum spans and unusable domains", () => {
    expect(() => createValueScale({ values: [NaN], y0: 100, y1: 0 })).toThrow(RangeError);
    expect(() => createValueScale({ values: [80], extra: [Infinity], y0: 100, y1: 0 })).toThrow(RangeError);
    expect(() => createValueScale({ values: [80], minSpan: 0, y0: 100, y1: 0 })).toThrow(RangeError);
    expect(() => createValueScale({ values: [80], y0: Infinity, y1: 0 })).toThrow(RangeError);
    expect(() => createValueScale({ values: [-Number.MAX_VALUE, Number.MAX_VALUE], y0: 100, y1: 0 })).toThrow(RangeError);
    const { scale } = createValueScale({ values: [80], y0: 100, y1: 0 });
    expect(() => scale(Infinity)).toThrow(RangeError);
  });
});

describe("nice ticks", () => {
  it("returns clean half-unit, integer and larger steps", () => {
    expect(niceTicks(80, 82, 5)).toEqual([80, 80.5, 81, 81.5, 82]);
    expect(niceTicks(0, 4, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(niceTicks(0, 8, 5)).toEqual([0, 2, 4, 6, 8]);
    expect(niceTicks(0, 20, 5)).toEqual([0, 5, 10, 15, 20]);
  });

  it("keeps ticks inside the domain, including negative and decimal ranges", () => {
    expect(niceTicks(79.7, 84.3, 5)).toEqual([80, 82, 84]);
    expect(niceTicks(-1, 1, 5)).toEqual([-1, -0.5, 0, 0.5, 1]);
    expect(niceTicks(0.1, 0.5, 5)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
    expect(niceTicks(0.001, 0.005, 5)).toEqual([0.001, 0.002, 0.003, 0.004, 0.005]);
    expect(niceTicks(0.1, 0.3, 3)).toEqual([0.1, 0.2, 0.3]);
    expect(niceTicks(-0.3, -0.1, 3)).toEqual([-0.3, -0.2, -0.1]);
  });

  it("handles a flat domain and normalizes negative zero", () => {
    expect(niceTicks(83.4, 83.4, 5)).toEqual([83.4]);
    expect(niceTicks(-0, 0, 5)).toEqual([0]);
    expect(niceTicks(-0.1, 0.1, 3)).toEqual([-0.1, 0, 0.1]);
  });

  it("rejects invalid bounds and impractical tick counts", () => {
    expect(() => niceTicks(2, 1, 5)).toThrow(RangeError);
    expect(() => niceTicks(NaN, 1, 5)).toThrow(RangeError);
    expect(() => niceTicks(0, Infinity, 5)).toThrow(RangeError);
    for (const count of [0, 1, 2.5, 1001, Infinity]) {
      expect(() => niceTicks(0, 1, count)).toThrow(RangeError);
    }
  });
});

describe("line points", () => {
  it("sorts a copy, preserves missing days and builds SVG coordinates", () => {
    const source = [
      { date: "2026-10-11", value: 30 },
      { date: "2026-10-01", value: 10 },
      { date: "2026-10-02", value: 20 },
    ];
    const x = createDateScale({ startKey: "2026-10-01", endKey: "2026-10-11", x0: 0, x1: 100 });
    const result = buildLinePoints(source, x, (value) => 100 - value);
    expect(result.points).toEqual([
      { date: "2026-10-01", value: 10, x: 0, y: 90 },
      { date: "2026-10-02", value: 20, x: 10, y: 80 },
      { date: "2026-10-11", value: 30, x: 100, y: 70 },
    ]);
    expect(result.svgPoints).toBe("0,90 10,80 100,70");
    expect(source[0].date).toBe("2026-10-11");
  });

  it("returns no synthetic points for empty data and one point for a singleton", () => {
    expect(buildLinePoints([], () => 0, (value) => value)).toEqual({ points: [], svgPoints: "" });
    expect(buildLinePoints([{ date: "2026-10-19", value: 83.4 }], () => 50, () => 60)).toEqual({
      points: [{ date: "2026-10-19", value: 83.4, x: 50, y: 60 }],
      svgPoints: "50,60",
    });
  });

  it("rejects nonfinite source values and coordinate results", () => {
    const point = { date: "2026-10-19", value: 83.4 };
    expect(() => buildLinePoints([point], () => Infinity, () => 0)).toThrow(RangeError);
    expect(() => buildLinePoints([point], () => 0, () => NaN)).toThrow(RangeError);
    expect(() => buildLinePoints([{ ...point, value: NaN }], () => 0, () => 0)).toThrow(RangeError);
    expect(() => buildLinePoints([{ ...point, date: "2026-02-30" }], () => 0, () => 0)).toThrow(RangeError);
  });
});

describe("value scale floor", () => {
  it("cuts the padded domain at the floor and keeps the scale linear", () => {
    const { min, max, scale } = createValueScale({ values: [5], y0: 100, y1: 0, minSpan: 30, floor: 0 });

    expect(min).toBe(0);
    expect(max).toBeGreaterThan(5);
    expect(scale(0)).toBe(100);
    expect(scale(max)).toBe(0);
    expect(niceTicks(min, max).every((tick) => tick >= 0)).toBe(true);
  });
});
