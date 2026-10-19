import { differenceInDays } from "../dates";
import type {
  TDateScale,
  TDateScaleOptions,
  TValueScaleOptions,
  TValueScaleResult,
} from "./charts.types";

const assertFinite = (...values: number[]) => {
  if (!values.every(Number.isFinite)) {
    throw new RangeError("Chart values and coordinates must be finite.");
  }
};

export const createDateScale = ({
  startKey,
  endKey,
  x0,
  x1,
}: TDateScaleOptions): TDateScale => {
  assertFinite(x0, x1, x1 - x0);
  const days = differenceInDays(endKey, startKey);
  if (days < 0) throw new RangeError("The date domain must be in ascending order.");

  return (dateKey) => {
    const offset = differenceInDays(dateKey, startKey);
    const x = days === 0 ? x0 + (x1 - x0) / 2 : x0 + (offset / days) * (x1 - x0);
    assertFinite(x);
    return x === 0 ? 0 : x;
  };
};

export const createValueScale = ({
  values,
  y0,
  y1,
  minSpan = 1,
  extra = [],
  floor = -Infinity,
}: TValueScaleOptions): TValueScaleResult => {
  assertFinite(y0, y1, y1 - y0, minSpan);
  if (minSpan <= 0) throw new RangeError("The minimum chart span must be positive.");

  let dataMin = Infinity;
  let dataMax = -Infinity;
  for (const group of [values, extra]) {
    for (const value of group) {
      assertFinite(value);
      dataMin = Math.min(dataMin, value);
      dataMax = Math.max(dataMax, value);
    }
  }

  if (dataMin === Infinity) {
    dataMin = 0;
    dataMax = minSpan;
  }

  const span = Math.max(dataMax - dataMin, minSpan);
  const center = dataMin + (dataMax - dataMin) / 2;
  const padding = span * 0.1;
  // A count or a duration cannot go below its floor, so the padded domain is
  // cut there instead of showing impossible negative ticks.
  const min = Math.max(center - span / 2 - padding, floor);
  const max = center + span / 2 + padding;
  assertFinite(min, max, max - min);
  if (min >= max) throw new RangeError("The chart span is too small for these values.");

  return {
    min,
    max,
    scale: (value) => {
      assertFinite(value);
      const y = y0 + ((value - min) / (max - min)) * (y1 - y0);
      assertFinite(y);
      return y === 0 ? 0 : y;
    },
  };
};

export const niceTicks = (min: number, max: number, count = 5): number[] => {
  assertFinite(min, max, max - min);
  if (min > max) throw new RangeError("The tick domain must be in ascending order.");
  if (!Number.isSafeInteger(count) || count < 2 || count > 1000) {
    throw new RangeError("The requested tick count must be between 2 and 1000.");
  }
  if (min === max) return [min === 0 ? 0 : min];

  const target = (max - min) / (count - 1);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const fraction = target / magnitude;
  const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * magnitude;
  if (!Number.isFinite(step) || step <= 0) {
    throw new RangeError("The chart span is too small for a tick step.");
  }

  const minIndex = min / step;
  const maxIndex = max / step;
  // Binary rounding can put a decimal endpoint just outside its integer tick index.
  const first = Math.ceil(minIndex - Number.EPSILON * Math.max(1, Math.abs(minIndex)) * 4);
  const last = Math.floor(maxIndex + Number.EPSILON * Math.max(1, Math.abs(maxIndex)) * 4);
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const ticks: number[] = [];

  for (let index = 0; index <= last - first; index += 1) {
    const raw = (first + index) * step;
    const value = Number(decimals <= 100 ? raw.toFixed(decimals) : raw.toPrecision(15));
    const tick = value === 0 ? 0 : value;
    if (tick >= min && tick <= max && tick !== ticks.at(-1)) ticks.push(tick);
  }

  return ticks;
};
