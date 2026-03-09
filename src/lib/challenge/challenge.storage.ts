import type { TLocalProgressMap } from "./challenge.types";

const STORAGE_PREFIX = "fit-challenge-progress";

export const getChallengeStorageKey = (runSlug: string) =>
  `${STORAGE_PREFIX}:${runSlug}`;

export const readChallengeProgress = (runSlug: string): TLocalProgressMap => {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem(getChallengeStorageKey(runSlug));
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as TLocalProgressMap;
    return parsed ?? {};
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
