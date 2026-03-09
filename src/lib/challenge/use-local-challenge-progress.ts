import { useEffect, useMemo, useState } from "react";
import type { TLocalProgressMap } from "./challenge.types";
import {
  readChallengeProgress,
  writeChallengeProgress,
} from "./challenge.storage";

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

      if (currentRunMap[key]?.done) {
        const nextRunMap = { ...currentRunMap };
        delete nextRunMap[key];
        return {
          ...current,
          [runSlug]: nextRunMap,
        };
      }

      return {
        ...current,
        [runSlug]: {
          ...currentRunMap,
          [key]: {
            done: true,
            completedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  return {
    progressMap,
    toggleDayDone,
  };
};
