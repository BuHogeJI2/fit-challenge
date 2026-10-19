import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToday } from "../lib/dates";

describe("useToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 19, 23, 59, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("moves to the next day after midnight", () => {
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("2026-10-19");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current).toBe("2026-10-20");
  });

  it("refreshes when the page becomes visible again", () => {
    const { result } = renderHook(() => useToday());

    vi.setSystemTime(new Date(2026, 9, 21, 9, 0, 0));
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current).toBe("2026-10-21");
  });
});
