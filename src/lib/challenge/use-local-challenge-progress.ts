import { useEffect, useMemo, useState } from "react";
import type {
  TLocalExerciseProgress,
  TLocalProgressEntry,
  TLocalProgressMap,
} from "./challenge.types";
import {
  readChallengeProgress,
  writeChallengeProgress,
} from "./challenge.storage";

const createSetId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const hasExerciseProgress = (
  exerciseProgress?: Record<string, TLocalExerciseProgress>,
) =>
  Boolean(
    exerciseProgress &&
      Object.values(exerciseProgress).some((progress) => progress.sets.length > 0),
  );

const pruneProgressEntry = (entry: TLocalProgressEntry): TLocalProgressEntry | null => {
  const exerciseProgress = hasExerciseProgress(entry.exerciseProgress)
    ? entry.exerciseProgress
    : undefined;

  if (!entry.done && !exerciseProgress) {
    return null;
  }

  return {
    done: entry.done,
    completedAt: entry.done ? entry.completedAt : null,
    exerciseProgress,
  };
};

const ensureProgressEntry = (
  currentRunMap: TLocalProgressMap,
  dayKey: string,
): TLocalProgressEntry => currentRunMap[dayKey] ?? {
  done: false,
  completedAt: null,
  exerciseProgress: undefined,
};

export const useLocalChallengeProgress = (runSlug: string | null) => {
  const [progressByRun, setProgressByRun] = useState<Record<string, TLocalProgressMap>>({});

  const progressMap = useMemo(() => {
    if (!runSlug) {
      return {};
    }

    return progressByRun[runSlug] ?? readChallengeProgress(runSlug);
  }, [progressByRun, runSlug]);

  useEffect(() => {
    if (!runSlug) return;
    writeChallengeProgress(runSlug, progressMap);
  }, [progressMap, runSlug]);

  const toggleDayDone = (dayNumber: number) => {
    if (!runSlug) return;

    setProgressByRun((current) => {
      const key = String(dayNumber);
      const currentRunMap = current[runSlug] ?? readChallengeProgress(runSlug);
      const currentEntry = ensureProgressEntry(currentRunMap, key);

      if (currentEntry.done) {
        const nextEntry = pruneProgressEntry({
          ...currentEntry,
          done: false,
          completedAt: null,
        });
        const nextRunMap = { ...currentRunMap };

        if (nextEntry) {
          nextRunMap[key] = nextEntry;
        } else {
          delete nextRunMap[key];
        }

        return {
          ...current,
          [runSlug]: nextRunMap,
        };
      }

      return {
        ...current,
        [runSlug]: {
          ...currentRunMap,
          [key]: pruneProgressEntry({
            ...currentEntry,
            done: true,
            completedAt: new Date().toISOString(),
          })!,
        },
      };
    });
  };

  const addExerciseSet = (dayNumber: number, exerciseId: number, reps: number) => {
    if (!runSlug || !Number.isInteger(reps) || reps <= 0) return;

    setProgressByRun((current) => {
      const dayKey = String(dayNumber);
      const exerciseKey = String(exerciseId);
      const currentRunMap = current[runSlug] ?? readChallengeProgress(runSlug);
      const currentEntry = ensureProgressEntry(currentRunMap, dayKey);
      const currentExerciseProgress =
        currentEntry.exerciseProgress?.[exerciseKey] ?? { sets: [] };

      return {
        ...current,
        [runSlug]: {
          ...currentRunMap,
          [dayKey]: {
            ...currentEntry,
            exerciseProgress: {
              ...currentEntry.exerciseProgress,
              [exerciseKey]: {
                sets: [
                  ...currentExerciseProgress.sets,
                  {
                    id: createSetId(),
                    reps,
                    createdAt: new Date().toISOString(),
                  },
                ],
              },
            },
          },
        },
      };
    });
  };

  const removeExerciseSet = (
    dayNumber: number,
    exerciseId: number,
    setId: string,
  ) => {
    if (!runSlug) return;

    setProgressByRun((current) => {
      const dayKey = String(dayNumber);
      const exerciseKey = String(exerciseId);
      const currentRunMap = current[runSlug] ?? readChallengeProgress(runSlug);
      const currentEntry = currentRunMap[dayKey];
      const currentExerciseProgress = currentEntry?.exerciseProgress?.[exerciseKey];

      if (!currentEntry || !currentExerciseProgress) {
        return current;
      }

      const nextSets = currentExerciseProgress.sets.filter((set) => set.id !== setId);
      const nextExerciseProgress = { ...currentEntry.exerciseProgress };

      if (nextSets.length) {
        nextExerciseProgress[exerciseKey] = { sets: nextSets };
      } else {
        delete nextExerciseProgress[exerciseKey];
      }

      const nextEntry = pruneProgressEntry({
        ...currentEntry,
        exerciseProgress: Object.keys(nextExerciseProgress).length
          ? nextExerciseProgress
          : undefined,
      });
      const nextRunMap = { ...currentRunMap };

      if (nextEntry) {
        nextRunMap[dayKey] = nextEntry;
      } else {
        delete nextRunMap[dayKey];
      }

      return {
        ...current,
        [runSlug]: nextRunMap,
      };
    });
  };

  return {
    progressMap,
    toggleDayDone,
    addExerciseSet,
    removeExerciseSet,
  };
};
