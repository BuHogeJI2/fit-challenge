import { addDays, getWeekStart } from "../dates";
import type { TExercise, TMetric, TSet } from "../db";

export type TDailyBest = {
  date: string;
  value: number;
};

export type TExerciseProgress = {
  first: TDailyBest;
  latest: TDailyBest;
  best: TDailyBest;
  changeSinceFirst: number;
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

/**
 * The best value of each logged day, oldest first: most reps for `reps`,
 * most reps at `loadKg` for `reps_weight`, longest hold for `time`.
 * Days without a matching set are left out, never filled with zero.
 */
export const getDailyBest = (
  metric: TMetric,
  sets: readonly TSet[],
  loadKg: number | null = null,
): TDailyBest[] => {
  const bestByDate = new Map<string, number>();

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

    bestByDate.set(set.date, Math.max(bestByDate.get(set.date) ?? 0, value));
  }

  return [...bestByDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((left, right) => left.date.localeCompare(right.date));
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
  dailyBest: readonly TDailyBest[],
): TExerciseProgress | null => {
  const first = dailyBest[0];
  const latest = dailyBest.at(-1);

  if (!first || !latest) {
    return null;
  }

  const best = dailyBest.reduce(
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
