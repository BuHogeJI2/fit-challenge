import type { TMetric } from "../../lib/db";

export const METRIC_LABELS: Record<TMetric, string> = {
  reps: "Reps",
  reps_weight: "Reps + weight",
  time: "Time",
};

export const METRIC_HINTS: Record<TMetric, string> = {
  reps: "Push-ups, pull-ups",
  reps_weight: "Squats, rows with a load",
  time: "Plank, hangs",
};
