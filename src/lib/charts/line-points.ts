import { parseDateKey } from "../dates";
import type {
  TChartPoint,
  TDateScale,
  TLinePoints,
  TValueScale,
} from "./charts.types";

export const buildLinePoints = (
  points: readonly TChartPoint[],
  xScale: TDateScale,
  yScale: TValueScale,
): TLinePoints => {
  const mapped = [...points]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map(({ date, value }) => {
      if (parseDateKey(date) === null) {
        throw new RangeError("Line points must have valid YYYY-MM-DD dates.");
      }
      const x = xScale(date);
      const y = yScale(value);
      if (![value, x, y].every(Number.isFinite)) {
        throw new RangeError("Line points must have finite values and coordinates.");
      }
      return { date, value, x: x === 0 ? 0 : x, y: y === 0 ? 0 : y };
    });

  return {
    points: mapped,
    svgPoints: mapped.map(({ x, y }) => `${x},${y}`).join(" "),
  };
};
