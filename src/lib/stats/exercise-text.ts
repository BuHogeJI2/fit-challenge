import { addDays, formatDateInContext } from "../dates";
import type { TMetric, TProgressView, TSet } from "../db";
import { formatDuration, formatLoadValue, formatReps } from "../numbers";
import type { TDailyValue, TExerciseProgress } from "./exercise.stats";

export type TSetDisplayValues = Pick<TSet, "reps" | "weightKg" | "seconds">;

export type TDescribeExerciseProgressOptions = {
  metric: TMetric;
  view: TProgressView;
  progress: TExerciseProgress | null;
  loadKg: number | null;
  todayKey: string;
};

const countFormatter = new Intl.NumberFormat("en-US");

const requireValue = (value: number | null) => {
  if (value === null) throw new RangeError("The metric requires a value.");
  return value;
};

const RECENT_SESSION_DAYS = 28;

const formatSessions = (count: number) =>
  `${countFormatter.format(count)} ${count === 1 ? "session" : "sessions"}`;

/** The word for one logged entry of a metric: "session" or "set". */
export const getEntryNoun = (metric: TMetric) => (metric === "session" ? "session" : "set");

export const formatSetValues = (metric: TMetric, values: TSetDisplayValues): string => {
  if (metric === "session") return "session";
  if (metric === "time") return formatDuration(requireValue(values.seconds));
  if (metric === "reps_weight") {
    return `${countFormatter.format(requireValue(values.reps))} × ${formatLoadValue(requireValue(values.weightKg))} kg`;
  }
  return formatReps(requireValue(values.reps));
};

export const formatProgressValue = (metric: TMetric, value: number): string => {
  if (metric === "session") return formatSessions(value);
  return metric === "time" ? formatDuration(value) : formatReps(value);
};

const describeLatestBest = (metric: TMetric, isRecord: boolean, value: string, loadKg: number | null) => {
  if (metric === "time") return `${isRecord ? "Longest hold" : "Latest hold"} ${value}`;
  if (metric === "reps_weight") {
    return `${isRecord ? "" : "Latest "}${value} at ${formatLoadValue(requireValue(loadKg))} kg`;
  }
  return `${isRecord ? "Best set" : "Latest best set"} ${value}`;
};

const describeLatestTotal = (metric: TMetric, isRecord: boolean, value: string, loadKg: number | null) => {
  const load = metric === "reps_weight" ? ` at ${formatLoadValue(requireValue(loadKg))} kg` : "";
  return `${isRecord ? "Best day" : "Latest day"} ${value}${load}`;
};

export const describeExerciseProgress = ({
  metric,
  view,
  progress,
  loadKg,
  todayKey,
}: TDescribeExerciseProgressOptions): string => {
  if (!progress) return "No sets yet.";

  const { first, latest, best } = progress;
  const isRecord = latest.value === best.value;
  const latestValue = formatProgressValue(metric, latest.value);
  const formatDate = (dateKey: string) => formatDateInContext(dateKey, todayKey);
  const describeLatest = view === "best" ? describeLatestBest : describeLatestTotal;
  const lead = describeLatest(metric, isRecord, latestValue, loadKg);

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

/**
 * How often sessions happened: the count in the last 28 days up to
 * `todayKey`, and the count over all time when older sessions exist.
 * `daily` holds the number of sessions of each logged day.
 */
export const describeSessionProgress = (daily: readonly TDailyValue[], todayKey: string): string => {
  if (!daily.length) return "No sessions yet.";

  const windowStart = addDays(todayKey, 1 - RECENT_SESSION_DAYS);
  const sum = (days: readonly TDailyValue[]) => days.reduce((total, day) => total + day.value, 0);
  const total = sum(daily);
  const recent = sum(daily.filter((day) => day.date >= windowStart && day.date <= todayKey));

  if (recent === total) return `${formatSessions(recent)} in the last 4 weeks.`;
  const lead = recent === 0 ? "No sessions" : formatSessions(recent);
  return `${lead} in the last 4 weeks, ${countFormatter.format(total)} in total.`;
};
