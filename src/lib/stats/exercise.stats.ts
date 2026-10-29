import { addDays, differenceInDays, getWeekStart } from "../dates";
import type { TExercise, TMetric, TSet } from "../db";

export type TDailyValue = {
  date: string;
  value: number;
};

export type TExerciseProgress = {
  first: TDailyValue;
  latest: TDailyValue;
  best: TDailyValue;
  changeSinceFirst: number;
};

export type TTotalBars = {
  stepDays: 1 | 7;
  startKey: string;
  endKey: string;
  bars: TDailyValue[];
};

export type TSetDay = {
  date: string;
  sets: TSet[];
  totalReps: number | null;
  totalSeconds: number | null;
};

const compareSets = (left: TSet, right: TSet) =>
  left.date.localeCompare(right.date) || left.createdAt.localeCompare(right.createdAt);

export const sortSets = (sets: readonly TSet[]) => [...sets].sort(compareSets);

const getSetValue = (metric: TMetric, set: TSet) =>
  metric === "time" ? set.seconds : set.reps;

const getDailyValues = (
  metric: TMetric,
  sets: readonly TSet[],
  loadKg: number | null,
  combine: (current: number, value: number) => number,
): TDailyValue[] => {
  const valueByDate = new Map<string, number>();

  for (const set of sets) {
    if (metric === "reps_weight") {
      if (loadKg === null || set.weightKg !== loadKg) {
        continue;
      }
    }

    const value = getSetValue(metric, set);
    if (value === null) {
      continue;
    }

    const current = valueByDate.get(set.date);
    valueByDate.set(set.date, current === undefined ? value : combine(current, value));
  }

  return [...valueByDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((left, right) => left.date.localeCompare(right.date));
};

/**
 * The best value of each logged day, oldest first: most reps for `reps`,
 * most reps at `loadKg` for `reps_weight`, longest hold for `time`.
 * Days without a matching set are left out, never filled with zero.
 */
export const getDailyBest = (
  metric: TMetric,
  sets: readonly TSet[],
  loadKg: number | null = null,
): TDailyValue[] => getDailyValues(metric, sets, loadKg, Math.max);

/**
 * The total of each logged day, oldest first: all reps for `reps`, reps at
 * `loadKg` for `reps_weight`, seconds held for `time`. Days without a
 * matching set are left out, never filled with zero.
 */
export const getDailyTotal = (
  metric: TMetric,
  sets: readonly TSet[],
  loadKg: number | null = null,
): TDailyValue[] => getDailyValues(metric, sets, loadKg, (current, value) => current + value);

export const getDailyProgress = (
  exercise: TExercise,
  sets: readonly TSet[],
  loadKg: number | null,
): TDailyValue[] =>
  exercise.progressView === "best"
    ? getDailyBest(exercise.metric, sets, loadKg)
    : getDailyTotal(exercise.metric, sets, loadKg);

// Longer spans group by week: a day bar would be too thin to read or tap.
export const MAX_DAILY_BAR_SPAN = 60;

/**
 * Day totals as bars from the first logged day to today, so days without
 * sets stay visible as empty slots. A span over `MAX_DAILY_BAR_SPAN` days
 * groups the totals into Monday-based weeks, dated by their Monday.
 */
export const getTotalBars = (daily: readonly TDailyValue[], todayKey: string): TTotalBars | null => {
  const first = daily[0];
  const last = daily.at(-1);
  if (!first || !last) return null;

  const endKey = last.date > todayKey ? last.date : todayKey;
  if (differenceInDays(endKey, first.date) <= MAX_DAILY_BAR_SPAN) {
    return { stepDays: 1, startKey: first.date, endKey, bars: [...daily] };
  }

  const totalByWeek = new Map<string, number>();
  for (const day of daily) {
    const week = getWeekStart(day.date);
    totalByWeek.set(week, (totalByWeek.get(week) ?? 0) + day.value);
  }

  return {
    stepDays: 7,
    startKey: getWeekStart(first.date),
    endKey: getWeekStart(endKey),
    bars: [...totalByWeek.entries()].map(([date, value]) => ({ date, value })),
  };
};

export const getLoads = (sets: readonly TSet[]) => {
  const loads = new Set<number>();

  for (const set of sets) {
    if (set.weightKg !== null) {
      loads.add(set.weightKg);
    }
  }

  return [...loads].sort((left, right) => left - right);
};

export const getLatestSet = (sets: readonly TSet[]) => sortSets(sets).at(-1) ?? null;

export const getProgressLoad = (exercise: TExercise, sets: readonly TSet[]) => {
  if (exercise.metric !== "reps_weight") {
    return null;
  }

  const saved = exercise.progressWeightKg;
  if (saved !== null && sets.some((set) => set.weightKg === saved)) {
    return saved;
  }

  return getLatestSet(sets)?.weightKg ?? null;
};

export const getExerciseProgress = (
  daily: readonly TDailyValue[],
): TExerciseProgress | null => {
  const first = daily[0];
  const latest = daily.at(-1);

  if (!first || !latest) {
    return null;
  }

  const best = daily.reduce(
    (current, day) => (day.value > current.value ? day : current),
    first,
  );

  return {
    first,
    latest,
    best,
    changeSinceFirst: latest.value - first.value,
  };
};

const sumOrNull = (values: (number | null)[]) => {
  const present = values.filter((value): value is number => value !== null);
  return present.length ? present.reduce((sum, value) => sum + value, 0) : null;
};

export const groupSetsByDay = (sets: readonly TSet[]): TSetDay[] => {
  const days = new Map<string, TSet[]>();

  for (const set of sortSets(sets)) {
    days.set(set.date, [...(days.get(set.date) ?? []), set]);
  }

  return [...days.entries()]
    .map(([date, daySets]) => ({
      date,
      sets: daySets,
      totalReps: sumOrNull(daySets.map((set) => set.reps)),
      totalSeconds: sumOrNull(daySets.map((set) => set.seconds)),
    }))
    .reverse();
};

export const countActiveDaysThisWeek = (sets: readonly TSet[], todayKey: string) => {
  const weekStart = getWeekStart(todayKey);
  const weekEnd = addDays(weekStart, 6);
  const dates = new Set(
    sets
      .map((set) => set.date)
      .filter((date) => date >= weekStart && date <= weekEnd),
  );

  return dates.size;
};
