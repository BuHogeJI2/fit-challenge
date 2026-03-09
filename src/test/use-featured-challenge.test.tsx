import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFeaturedChallenge } from "../lib/challenge";

const { mockFetchFeaturedChallenge } = vi.hoisted(() => ({
  mockFetchFeaturedChallenge: vi.fn(),
}));

vi.mock("../lib/challenge/challenge.api", () => ({
  fetchFeaturedChallenge: mockFetchFeaturedChallenge,
}));

describe("useFeaturedChallenge", () => {
  it("surfaces Supabase errors", async () => {
    mockFetchFeaturedChallenge.mockRejectedValue(new Error("runs failed"));

    const { result } = renderHook(() => useFeaturedChallenge());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("runs failed");
    expect(result.current.challenge).toBeNull();
  });
});
