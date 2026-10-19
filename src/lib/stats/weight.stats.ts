import { getMonthRange } from "../dates";
import type { TWeightEntry } from "../db";
import { roundToTenth } from "../numbers";

export type TWeightSummary = {
  latest: TWeightEntry | null;
  first: TWeightEntry | null;
  changeSinceFirstKg: number | null;
  toGoalKg: number | null;
};

export type TMonthWeightSummary = {
  count: number;
  averageKg: number | null;
  minKg: number | null;
  maxKg: number | null;
};

export type TWeightEntryWithChange = {
  entry: TWeightEntry;
  changeKg: number | null;
};

export const sortByDate = (entries: readonly TWeightEntry[]) =>
  [...entries].sort((left, right) => left.date.localeCompare(right.date));

export const getWeightSummary = (
  entries: readonly TWeightEntry[],
  goalWeightKg: number | null,
): TWeightSummary => {
  const sorted = sortByDate(entries);
  const first = sorted[0] ?? null;
  const latest = sorted[sorted.length - 1] ?? null;

  return {
    latest,
    first,
    changeSinceFirstKg:
      first && latest && sorted.length > 1
        ? roundToTenth(latest.weightKg - first.weightKg)
        : null,
    toGoalKg:
      latest && goalWeightKg !== null
        ? roundToTenth(latest.weightKg - goalWeightKg)
        : null,
  };
};

export const getEntriesInMonth = (
  entries: readonly TWeightEntry[],
  monthKey: string,
) => {
  const { start, end } = getMonthRange(monthKey);
  return sortByDate(entries).filter(
    (entry) => entry.date >= start && entry.date <= end,
  );
};

export const getMonthWeightSummary = (
  entries: readonly TWeightEntry[],
  monthKey: string,
): TMonthWeightSummary => {
  const values = getEntriesInMonth(entries, monthKey).map((entry) => entry.weightKg);

  if (!values.length) {
    return { count: 0, averageKg: null, minKg: null, maxKg: null };
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    count: values.length,
    averageKg: roundToTenth(total / values.length),
    minKg: Math.min(...values),
    maxKg: Math.max(...values),
  };
};

export const withChangeFromPrevious = (
  entries: readonly TWeightEntry[],
): TWeightEntryWithChange[] =>
  sortByDate(entries)
    .map((entry, index, sorted) => {
      const previous = sorted[index - 1];
      return {
        entry,
        changeKg: previous ? roundToTenth(entry.weightKg - previous.weightKg) : null,
      };
    })
    .reverse();
