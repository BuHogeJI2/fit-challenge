import { formatDateInContext } from "../dates";
import type { TMetric, TSet } from "../db";
import { formatDuration, formatLoadValue, formatReps } from "../numbers";
import type { TExerciseProgress } from "./exercise.stats";

export type TSetDisplayValues = Pick<TSet, "reps" | "weightKg" | "seconds">;

export type TDescribeExerciseProgressOptions = {
  metric: TMetric;
  progress: TExerciseProgress | null;
  loadKg: number | null;
  todayKey: string;
};

const countFormatter = new Intl.NumberFormat("en-US");

const requireValue = (value: number | null) => {
  if (value === null) throw new RangeError("The metric requires a value.");
  return value;
};

export const formatSetValues = (metric: TMetric, values: TSetDisplayValues): string => {
  if (metric === "time") return formatDuration(requireValue(values.seconds));
  if (metric === "reps_weight") {
    return `${countFormatter.format(requireValue(values.reps))} × ${formatLoadValue(requireValue(values.weightKg))} kg`;
  }
  return formatReps(requireValue(values.reps));
};

export const formatBestValue = (metric: TMetric, value: number): string =>
  metric === "time" ? formatDuration(value) : formatReps(value);

export const describeExerciseProgress = ({
  metric,
  progress,
  loadKg,
  todayKey,
}: TDescribeExerciseProgressOptions): string => {
  if (!progress) return "No sets yet.";

  const { first, latest, best } = progress;
  const isRecord = latest.value === best.value;
  const latestValue = formatBestValue(metric, latest.value);
  const formatDate = (dateKey: string) => formatDateInContext(dateKey, todayKey);

  let lead: string;
  if (metric === "time") {
    lead = `${isRecord ? "Longest hold" : "Latest hold"} ${latestValue}`;
  } else if (metric === "reps_weight") {
    lead = `${isRecord ? "" : "Latest "}${latestValue} at ${formatLoadValue(requireValue(loadKg))} kg`;
  } else {
    lead = `${isRecord ? "Best set" : "Latest best set"} ${latestValue}`;
  }

  if (first.date === latest.date) return `${lead} on ${formatDate(latest.date)}.`;

  const change = latest.value - first.value;
  const changeValue = metric === "time"
    ? formatDuration(Math.abs(change))
    : countFormatter.format(Math.abs(change));
  const comparison = change === 0
    ? `same as ${formatDate(first.date)}`
    : `${change > 0 ? "up" : "down"} ${changeValue} since ${formatDate(first.date)}`;
  const record = isRecord
    ? ""
    : ` Record ${metric === "time" ? formatDuration(best.value) : countFormatter.format(best.value)} on ${formatDate(best.date)}.`;

  return `${lead}, ${comparison}.${record}`;
};
