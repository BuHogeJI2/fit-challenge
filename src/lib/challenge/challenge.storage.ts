import type {
  TLocalExerciseProgress,
  TLocalProgressEntry,
  TLocalProgressMap,
  TLocalSetEntry,
} from "./challenge.types";

const STORAGE_PREFIX = "fit-challenge-progress";

export const getChallengeStorageKey = (runSlug: string) =>
  `${STORAGE_PREFIX}:${runSlug}`;

const normalizeSetEntry = (value: unknown): TLocalSetEntry | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TLocalSetEntry>;
  const reps = candidate.reps;

  if (
    typeof candidate.id !== "string" ||
    typeof reps !== "number" ||
    !Number.isInteger(reps) ||
    reps <= 0 ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    reps,
    createdAt: candidate.createdAt,
  };
};

const normalizeExerciseProgress = (
  value: unknown,
): Record<string, TLocalExerciseProgress> | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .map(([exerciseId, exerciseValue]) => {
      if (!exerciseValue || typeof exerciseValue !== "object") {
        return null;
      }

      const rawSets = Array.isArray(
        (exerciseValue as { sets?: unknown }).sets,
      )
        ? ((exerciseValue as { sets: unknown[] }).sets ?? [])
        : [];
      const sets = rawSets
        .map(normalizeSetEntry)
        .filter((set): set is TLocalSetEntry => set !== null);

      return [exerciseId, { sets }] as const;
    })
    .filter((entry): entry is readonly [string, TLocalExerciseProgress] => entry !== null)
    .filter(([, progress]) => progress.sets.length > 0);

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries);
};

const normalizeProgressEntry = (value: unknown): TLocalProgressEntry | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TLocalProgressEntry>;
  const exerciseProgress = normalizeExerciseProgress(candidate.exerciseProgress);

  return {
    done: Boolean(candidate.done),
    completedAt:
      typeof candidate.completedAt === "string" ? candidate.completedAt : null,
    exerciseProgress,
  };
};

export const readChallengeProgress = (runSlug: string): TLocalProgressMap => {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem(getChallengeStorageKey(runSlug));
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    const normalizedEntries = Object.entries(parsed ?? {})
      .map(([dayNumber, value]) => {
        const normalized = normalizeProgressEntry(value);
        if (!normalized) {
          return null;
        }

        return [dayNumber, normalized] as const;
      })
      .filter((entry): entry is readonly [string, TLocalProgressEntry] => entry !== null);

    return Object.fromEntries(normalizedEntries);
  } catch {
    return {};
  }
};

export const writeChallengeProgress = (
  runSlug: string,
  progressMap: TLocalProgressMap,
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getChallengeStorageKey(runSlug),
    JSON.stringify(progressMap),
  );
};
