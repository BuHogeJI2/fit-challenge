import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  getChallengeStorageKey,
  useLocalChallengeProgress,
} from "../lib/challenge";

describe("useLocalChallengeProgress", () => {
  const runSlug = "march-2026-pushups-situps-abs-run";
  const storageKey = getChallengeStorageKey(runSlug);

  afterEach(() => {
    window.localStorage.clear();
  });

  it("loads legacy done-only entries without crashing", async () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        1: {
          done: true,
          completedAt: "2026-03-15T10:00:00.000Z",
        },
      }),
    );

    const { result } = renderHook(() => useLocalChallengeProgress(runSlug));

    expect(result.current.progressMap["1"]?.done).toBe(true);
    expect(result.current.progressMap["1"]?.exerciseProgress).toBeUndefined();
  });

  it("keeps logged sets when completion is undone", async () => {
    const { result } = renderHook(() => useLocalChallengeProgress(runSlug));

    act(() => {
      result.current.addExerciseSet(1, 1, 25);
      result.current.toggleDayDone(1);
      result.current.toggleDayDone(1);
    });

    await waitFor(() =>
      expect(result.current.progressMap["1"]?.exerciseProgress?.["1"]?.sets).toHaveLength(1),
    );

    expect(result.current.progressMap["1"]?.done).toBe(false);
    expect(window.localStorage.getItem(storageKey)).toContain("\"exerciseProgress\"");
  });

  it("removes empty exercise progress when the last set is deleted", async () => {
    const { result } = renderHook(() => useLocalChallengeProgress(runSlug));

    act(() => {
      result.current.addExerciseSet(1, 1, 25);
    });

    const setId =
      result.current.progressMap["1"]?.exerciseProgress?.["1"]?.sets[0]?.id;

    expect(setId).toBeTruthy();

    act(() => {
      result.current.removeExerciseSet(1, 1, setId!);
    });

    await waitFor(() => expect(window.localStorage.getItem(storageKey)).toBe("{}"));
  });
});
