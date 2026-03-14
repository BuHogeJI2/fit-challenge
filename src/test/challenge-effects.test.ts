import { afterEach, describe, expect, it, vi } from "vitest";
import confetti from "canvas-confetti";
import {
  celebrateDayCompletion,
  prefersReducedMotion,
} from "../lib/challenge/challenge.effects";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

const createMatchMedia = (matches: boolean) =>
  vi.fn().mockImplementation(() => ({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

describe("challenge.effects", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  it("skips celebration when reduced motion is preferred", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: createMatchMedia(true),
    });

    expect(prefersReducedMotion()).toBe(true);
    expect(celebrateDayCompletion()).toBe(false);
    expect(confetti).not.toHaveBeenCalled();
  });
});
