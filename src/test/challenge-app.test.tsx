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

  it("renders upcoming day overlays as read-only even if future progress exists locally", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    window.localStorage.setItem(
      getChallengeStorageKey(featuredChallenge.run.slug),
      JSON.stringify({
        2: {
          done: false,
          completedAt: null,
          exerciseProgress: {
            3: {
              sets: [
                {
                  id: "future-set-1",
                  reps: 62,
                  createdAt: "2026-03-12T08:00:00.000Z",
                },
              ],
            },
          },
        },
      }),
    );

    render(<ChallengeApp />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open Day 2 for Mar 13" }),
    );

    const dialog = screen.getByRole("dialog");
    const dialogWithin = within(dialog);

    expect(dialogWithin.getByText("Pushups and abs.")).toBeInTheDocument();
    expect(
      dialogWithin.getByText(
        "This day is coming up next. Review the plan now; tracking unlocks on the day.",
      ),
    ).toBeInTheDocument();
    expect(dialogWithin.getByText("Pushups")).toBeInTheDocument();
    expect(dialogWithin.getByText("Abs")).toBeInTheDocument();
    expect(dialogWithin.getAllByText("62 reps")).toHaveLength(2);
    expect(dialogWithin.queryByText("Logged")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Remaining")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Sets")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Logged sets")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Goal reached")).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByLabelText("Add reps for Pushups"),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Add set" }),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Mark done" }),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Remove" }),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.getByRole("button", { name: "Back to challenge" }),
    ).toBeInTheDocument();
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

  it("shows past unfinished days as missed in the calendar", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Day 2 for Friday, March 13. Missed.",
      }),
    );

    expect(
      within(screen.getByRole("dialog")).getByText("Pushups and abs."),
    ).toBeInTheDocument();
  });

  it("renders logged day details as read-only review content", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    window.localStorage.setItem(
      getChallengeStorageKey(featuredChallenge.run.slug),
      JSON.stringify({
        1: {
          done: false,
          completedAt: null,
          exerciseProgress: {
            1: {
              sets: [
                {
                  id: "set-1",
                  reps: 20,
                  createdAt: "2026-03-15T08:00:00.000Z",
                },
                {
                  id: "set-2",
                  reps: 40,
                  createdAt: "2026-03-15T08:05:00.000Z",
                },
              ],
            },
          },
        },
      }),
    );

    render(<ChallengeApp />);

    fireEvent.click(screen.getByRole("button", { name: "Open day details" }));

    const dialogWithin = within(screen.getByRole("dialog"));

    expect(
      dialogWithin.getByText(
        "Review the plan for this day here. If you need to catch up, the progress actions are below.",
      ),
    ).toBeInTheDocument();
    expect(dialogWithin.queryByText("Logged")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Remaining")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Sets")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Logged sets")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("20 reps")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("40 reps")).not.toBeInTheDocument();
    expect(dialogWithin.queryByText("Goal reached")).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByLabelText("Add reps for Pushups"),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Add set" }),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Remove" }),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Mark done" }),
    ).toBeInTheDocument();
    expect(
      dialogWithin.getByRole("button", { name: "Track sets" }),
    ).toBeInTheDocument();
  });

  it("keeps current-day overlays informational without footer actions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    fireEvent.click(screen.getByRole("button", { name: "Open day details" }));

    const dialogWithin = within(screen.getByRole("dialog"));

    expect(
      dialogWithin.getByText("Review the plan for this day here."),
    ).toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Track sets" }),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Mark done" }),
    ).not.toBeInTheDocument();
    expect(
      dialogWithin.queryByRole("button", { name: "Undo completion" }),
    ).not.toBeInTheDocument();
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

    expect(screen.queryByText("Completed on this device. Reopen details if you want to review or adjust logged sets.")).not.toBeInTheDocument();

    expect(
      screen.getByText("0 of 3 days marked done on this device"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    const storedKey = getChallengeStorageKey(featuredChallenge.run.slug);
    expect(window.localStorage.getItem(storedKey)).toContain('"1"');
    expect(
      screen.getByText("1 of 3 days marked done on this device"),
    ).toBeInTheDocument();
    expect(screen.getByText("Day complete")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Completed on this device. Reopen details if you want to review or adjust logged sets.",
      ),
    ).toBeInTheDocument();
    expect(confetti).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Undo completion" }));

    expect(window.localStorage.getItem(storedKey)).toBe("{}");
    expect(screen.queryByText("Day complete")).not.toBeInTheDocument();
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it("opens the focused tracker from actionable featured exercises and updates progress", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    const featuredCard = screen.getByRole("button", { name: "Mark done" }).closest("section");
    expect(featuredCard).not.toBeNull();
    const featuredWithin = within(featuredCard!);

    expect(screen.queryByText(/reps logged/i)).not.toBeInTheDocument();
    expect(featuredWithin.getAllByText("60 reps")).toHaveLength(2);
    expect(featuredWithin.getAllByText("Daily target").slice(-2)).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "Track sets for Pushups" }),
    );

    const tracker = screen.getByRole("dialog");
    expect(
      within(tracker).getByText(
        "Track sets for this exercise here. The main screen updates as soon as you log or remove a set.",
      ),
    ).toBeInTheDocument();
    expect(within(tracker).getByText("Exercise target")).toBeInTheDocument();
    expect(
      within(tracker).getByText("No sets logged for this exercise yet."),
    ).toBeInTheDocument();
    expect(
      within(tracker).queryByRole("button", { name: "Mark done" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Add reps for Pushups"), {
      target: { value: "60" },
    });
    fireEvent.click(within(tracker).getByRole("button", { name: "Add set" }));

    expect(within(tracker).getByText("Goal reached")).toBeInTheDocument();
    expect(within(tracker).getAllByText("60 reps")).toHaveLength(2);
    expect(within(tracker).getByText("60 / 60")).toBeInTheDocument();
    expect(within(tracker).getByText("1 set")).toBeInTheDocument();

    expect(featuredWithin.getByText("60 / 60")).toBeInTheDocument();
    expect(featuredWithin.getByText("Goal reached")).toBeInTheDocument();
    expect(featuredWithin.getByText("60 reps")).toBeInTheDocument();
    expect(featuredWithin.getByText("1 set")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Exercise tracking now lives on the main card. Tap an exercise below to keep logging sets.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      within(tracker).getByRole("button", { name: "Back to challenge" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Track sets for Sit-Ups" }));
    const situpsTracker = screen.getByRole("dialog");

    fireEvent.change(screen.getByLabelText("Add reps for Sit-Ups"), {
      target: { value: "60" },
    });
    fireEvent.click(
      within(situpsTracker).getByRole("button", { name: "Add set" }),
    );

    expect(screen.getByText("120/120 reps logged")).toBeInTheDocument();
    expect(featuredWithin.getAllByText("60 / 60")).toHaveLength(2);
    expect(featuredWithin.getAllByText("Goal reached")).toHaveLength(2);
    expect(
      screen.getByText(
        "Targets reached. Mark the day done when you are ready.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      within(situpsTracker).getByRole("button", { name: "Back to challenge" }),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Track sets for Pushups" }),
    );
    const removeTracker = screen.getByRole("dialog");
    fireEvent.click(
      within(removeTracker).getByRole("button", { name: "Remove" }),
    );

    expect(screen.getByText("60/120 reps logged")).toBeInTheDocument();
    expect(within(removeTracker).queryByText("Goal reached")).not.toBeInTheDocument();
    expect(featuredWithin.getByText("60 reps")).toBeInTheDocument();
    expect(featuredWithin.getAllByText("Daily target").slice(-1)).toHaveLength(1);
    expect(featuredWithin.getByText("60 / 60")).toBeInTheDocument();
    expect(featuredWithin.getByText("Goal reached")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Targets reached. Mark the day done when you are ready.",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not open the focused tracker for non-actionable featured exercises", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    expect(
      screen.queryByRole("button", { name: "Track sets for Pushups" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Pushups"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("Tracking unlocks on the day")).toHaveLength(2);
  });

  it("opens past-day tracking from the day overlay footer", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Day 2 for Friday, March 13. Missed.",
      }),
    );

    const details = screen.getByRole("dialog");
    expect(
      within(details).getByText(
        "Review the plan for this day here. If you need to catch up, the progress actions are below.",
      ),
    ).toBeInTheDocument();
    expect(within(details).getByRole("button", { name: "Track sets" })).toBeInTheDocument();
    expect(within(details).getByRole("button", { name: "Mark done" })).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Selected calendar day actions"),
    ).not.toBeInTheDocument();

    fireEvent.click(within(details).getByRole("button", { name: "Track sets" }));

    const picker = screen.getByRole("dialog");
    expect(
      within(picker).getByText("Choose which exercise you want to track for this day."),
    ).toBeInTheDocument();
    fireEvent.click(within(picker).getByRole("button", { name: /Pushups/i }));

    const tracker = screen.getByRole("dialog");
    expect(within(tracker).getByText("0 / 62")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Add reps for Pushups"), {
      target: { value: "31" },
    });
    fireEvent.click(within(tracker).getByRole("button", { name: "Add set" }));

    expect(within(tracker).getByText("31 / 62")).toBeInTheDocument();
    expect(screen.getByText("1 set")).toBeInTheDocument();
  });

  it("toggles past-day completion inside the day overlay footer", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
    mockUseFeaturedChallenge.mockReturnValue({
      challenge: featuredChallenge,
      loading: false,
      error: null,
    });

    render(<ChallengeApp />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Day 2 for Friday, March 13. Missed.",
      }),
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Mark done" }));

    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Undo completion" })).toBeInTheDocument();
  });

  it("keeps past-day footer actions hidden for non-actionable overlays", async () => {
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

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.queryByRole("button", { name: "Track sets" })).not.toBeInTheDocument();
    expect(dialog.queryByRole("button", { name: "Mark done" })).not.toBeInTheDocument();
    expect(dialog.queryByRole("button", { name: "Undo completion" })).not.toBeInTheDocument();
  });
});
