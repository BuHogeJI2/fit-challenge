import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import confetti from "canvas-confetti";
import { ChallengeApp } from "../components/challenge-app";
import { getChallengeStorageKey } from "../lib/challenge";
import type { TFeaturedChallenge } from "../lib/challenge";

const mockUseFeaturedChallenge = vi.fn();

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

vi.mock("../lib/challenge", async () => {
  const actual = await vi.importActual<typeof import("../lib/challenge")>(
    "../lib/challenge",
  );

  return {
    ...actual,
    useFeaturedChallenge: () => mockUseFeaturedChallenge(),
  };
});

const featuredChallenge: TFeaturedChallenge = {
  template: {
    id: 1,
    slug: "pushups-situps-abs-30-day",
    title: "Pushups, Sit-ups, Abs Challenge",
    description: "A progressive 30-day rep ladder.",
    durationDays: 30,
    difficulty: "medium",
    coverNote: "Split the reps across as many sets as you need.",
    isPublished: true,
  },
  run: {
    id: 2,
    templateId: 1,
    slug: "march-2026-pushups-situps-abs-run",
    titleOverride: "Official Challenge Starting March 12, 2026",
    descriptionOverride: null,
    startsOn: "2026-03-12",
    endsOn: "2026-04-10",
    status: "scheduled",
  },
  days: [
    {
      id: 101,
      runId: 2,
      dayNumber: 1,
      date: "2026-03-12",
      title: "Day 1",
      summary: "Open with pushups and sit-ups.",
      notes: "Stay smooth and avoid rushing your first sets.",
      estimatedMinutes: 20,
      isRestDay: false,
      changeNote: "Abs moved to day 2 for better opening balance.",
      updatedAt: "2026-03-10T12:00:00.000Z",
      exercises: [
        {
          id: 1,
          challengeDayId: 101,
          position: 1,
          exerciseName: "pushups",
          targetReps: 60,
          targetSeconds: null,
          restSeconds: 60,
          notes: "Break into clean sets.",
          substitution: null,
        },
        {
          id: 2,
          challengeDayId: 101,
          position: 2,
          exerciseName: "sit-ups",
          targetReps: 60,
          targetSeconds: null,
          restSeconds: 60,
          notes: null,
          substitution: null,
        },
      ],
    },
    {
      id: 102,
      runId: 2,
      dayNumber: 2,
      date: "2026-03-13",
      title: "Day 2",
      summary: "Pushups and abs.",
      notes: null,
      estimatedMinutes: 20,
      isRestDay: false,
      changeNote: null,
      updatedAt: "2026-03-11T12:00:00.000Z",
      exercises: [
        {
          id: 3,
          challengeDayId: 102,
          position: 1,
          exerciseName: "pushups",
          targetReps: 62,
          targetSeconds: null,
          restSeconds: 60,
          notes: null,
          substitution: null,
        },
        {
          id: 4,
          challengeDayId: 102,
          position: 2,
          exerciseName: "abs",
          targetReps: 62,
          targetSeconds: null,
          restSeconds: 60,
          notes: null,
          substitution: null,
        },
      ],
    },
    {
      id: 103,
      runId: 2,
      dayNumber: 3,
      date: "2026-03-14",
      title: "Day 3",
      summary: "Sit-ups and abs.",
      notes: null,
      estimatedMinutes: 20,
      isRestDay: false,
      changeNote: null,
      updatedAt: "2026-03-11T12:00:00.000Z",
      exercises: [
        {
          id: 5,
          challengeDayId: 103,
          position: 1,
          exerciseName: "sit-ups",
          targetReps: 64,
          targetSeconds: null,
          restSeconds: 60,
          notes: null,
          substitution: null,
        },
        {
          id: 6,
          challengeDayId: 103,
          position: 2,
          exerciseName: "abs",
          targetReps: 64,
          targetSeconds: null,
          restSeconds: 60,
          notes: null,
          substitution: null,
        },
      ],
    },
  ],
};

describe("ChallengeApp", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    window.localStorage.clear();
    cleanup();
  });

  it("renders the empty state when no featured run exists", () => {
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: null,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    expect(screen.getByText("No featured challenge")).toBeInTheDocument();
  });

  it("opens day details from the next-days list", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open Day 2 for Mar 13" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Pushups and abs.")).toBeInTheDocument();
  });

  it("opens day details from the calendar", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Day 3 for Saturday, March 14. Upcoming.",
      }),
    );

    expect(
      within(screen.getByRole("dialog")).getByText("Sit-ups and abs."),
    ).toBeInTheDocument();
  });

  it("persists local progress by run slug and supports undo", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    expect(
      screen.getByText("0 of 3 days marked done on this device"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    const storedKey = getChallengeStorageKey(featuredChallenge.run.slug);
    expect(window.localStorage.getItem(storedKey)).toContain('"1"');
    expect(
      screen.getByText("1 of 3 days marked done on this device"),
    ).toBeInTheDocument();
    expect(confetti).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Undo completion" }));

    expect(window.localStorage.getItem(storedKey)).toBe("{}");
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it("keeps set logging optional and highlights readiness after targets are logged", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    expect(screen.queryByText(/reps logged/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open day details" }));

    fireEvent.change(screen.getByLabelText("Add reps for pushups"), {
      target: { value: "60" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Add set" })[0]);

    fireEvent.change(screen.getByLabelText("Add reps for sit-ups"), {
      target: { value: "60" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Add set" })[1]);

    expect(screen.getByText("120/120 reps logged")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Targets reached. Mark the day done when you are ready.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(screen.getByText("60/120 reps logged")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Targets reached. Mark the day done when you are ready.",
      ),
    ).not.toBeInTheDocument();
  });
});
