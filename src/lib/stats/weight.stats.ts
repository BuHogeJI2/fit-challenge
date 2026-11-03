import { addDays, differenceInDays, getMonthRange, getWeekStart } from "../dates";
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

export type TWeekWeight = {
  weekStart: string;
  count: number;
  averageKg: number;
  changeKg: number | null;
};

export type TWeekWindow = {
  start: string;
  end: string;
};

export const WEEKS_PER_WINDOW = 12;

export type TWeightEntryWithChange = {
  entry: TWeightEntry;
  changeKg: number | null;
};

// Stored weights are whole tenths, so summing tenths as integers keeps an
// average such as 83.95 exact; a float sum can land on 83.9499… and round down.
const averageInTenths = (values: readonly number[]) => {
  const tenths = values.reduce((sum, value) => sum + Math.round(value * 10), 0);
  return Math.round(tenths / values.length) / 10;
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

  return {
    count: values.length,
    averageKg: averageInTenths(values),
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

export const getWeeklyWeights = (entries: readonly TWeightEntry[]): TWeekWeight[] => {
  const valuesByWeek = new Map<string, number[]>();
  for (const entry of sortByDate(entries)) {
    const weekStart = getWeekStart(entry.date);
    valuesByWeek.set(weekStart, [...(valuesByWeek.get(weekStart) ?? []), entry.weightKg]);
  }

  let previousKg: number | null = null;
  return [...valuesByWeek.entries()].map(([weekStart, values]) => {
    const averageKg = averageInTenths(values);
    // Rounded averages are compared so the change matches the shown values.
    const changeKg = previousKg === null ? null : roundToTenth(averageKg - previousKg);
    previousKg = averageKg;
    return { weekStart, count: values.length, averageKg, changeKg };
  });
};

export const getWeekWindow = (lastWeekStart: string): TWeekWindow => ({
  start: addDays(lastWeekStart, -(WEEKS_PER_WINDOW - 1) * 7),
  end: addDays(lastWeekStart, 6),
});

// Windows are counted back from the current week, so the latest one always
// ends with this week and paging never shifts the older ones.
export const getWindowLastWeek = (dateKey: string, todayKey: string): string => {
  const currentWeek = getWeekStart(todayKey);
  const windowDays = WEEKS_PER_WINDOW * 7;
  const windowsBack = Math.max(
    0,
    Math.floor(differenceInDays(currentWeek, getWeekStart(dateKey)) / windowDays),
  );
  return addDays(currentWeek, -windowsBack * windowDays);
};
