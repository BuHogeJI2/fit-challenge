import type { TMetric, TSet } from "./db.types";
import { assertPositiveInteger, normalizeLoadKg } from "./record-fields";
import { RepositoryError } from "./repository-error";

export type TSetValues = {
  reps: number | null;
  weightKg: number | null;
  seconds: number | null;
};

const assertNull = (value: number | null, label: string, metric: TMetric) => {
  if (value !== null) {
    throw new RepositoryError("invalid_input", `${label} is not used by ${metric}.`);
  }
};

const requireInteger = (value: number | null, label: string): number => {
  if (value === null) {
    throw new RepositoryError("invalid_input", `${label} is required.`);
  }
  assertPositiveInteger(value, label);
  return value;
};

/**
 * Returns the stored form of set values for a metric, or throws a
 * `RepositoryError` when they do not fit it: `reps` needs reps only,
 * `reps_weight` needs reps and weight (kept to 0.01 kg), `time` needs
 * seconds only, `session` needs no values.
 */
export const normalizeSetValues = (metric: TMetric, values: TSetValues): TSetValues => {
  switch (metric) {
    case "reps":
      assertNull(values.weightKg, "Weight", metric);
      assertNull(values.seconds, "Time", metric);
      return { reps: requireInteger(values.reps, "Reps"), weightKg: null, seconds: null };
    case "reps_weight":
      assertNull(values.seconds, "Time", metric);
      if (values.weightKg === null) {
        throw new RepositoryError("invalid_input", "Weight is required.");
      }
      return {
        reps: requireInteger(values.reps, "Reps"),
        weightKg: normalizeLoadKg(values.weightKg),
        seconds: null,
      };
    case "time":
      assertNull(values.reps, "Reps", metric);
      assertNull(values.weightKg, "Weight", metric);
      return { reps: null, weightKg: null, seconds: requireInteger(values.seconds, "Time") };
    case "session":
      assertNull(values.reps, "Reps", metric);
      assertNull(values.weightKg, "Weight", metric);
      assertNull(values.seconds, "Time", metric);
      return { reps: null, weightKg: null, seconds: null };
  }
};

export const isStoredFormFor = (metric: TMetric, set: TSet) => {
  try {
    const normalized = normalizeSetValues(metric, set);
    return (
      normalized.reps === set.reps &&
      normalized.weightKg === set.weightKg &&
      normalized.seconds === set.seconds
    );
  } catch {
    return false;
  }
};
