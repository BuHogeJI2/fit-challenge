import { differenceInDays } from "../dates";
import type { TBandScale, TBandScaleOptions } from "./charts.types";

export const createBandScale = ({
  startKey,
  endKey,
  stepDays,
  x0,
  x1,
}: TBandScaleOptions): TBandScale => {
  if (!Number.isSafeInteger(stepDays) || stepDays < 1) {
    throw new RangeError("The band step must be a whole number of days.");
  }
  const days = differenceInDays(endKey, startKey);
  if (days < 0) throw new RangeError("The date domain must be in ascending order.");

  const slots = Math.floor(days / stepDays) + 1;
  const bandwidth = (x1 - x0) / slots;
  if (!Number.isFinite(bandwidth)) throw new RangeError("Chart coordinates must be finite.");

  return {
    bandwidth,
    // A date inside a slot maps between its centers, so month labels fall
    // where their day is, not on the nearest bar.
    center: (dateKey) => x0 + (differenceInDays(dateKey, startKey) / stepDays + 0.5) * bandwidth,
  };
};
