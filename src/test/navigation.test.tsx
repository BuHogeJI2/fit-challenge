import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../components/app";
import { addSet, createExercise, createTraining, saveWeightEntry } from "../lib/db";
import { getReturnPath, navigateApp, parseAppHash } from "../lib/navigation";
import { resetDatabase } from "./db-test-utils";

const renderAt = (hash: string) => { window.location.hash = hash; render(<App />); };

describe("period navigation", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 19, 9));
    await resetDatabase();
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("keeps queries inside the hash and removes an old outer query", () => {
    expect(parseAppHash("#/weight?view=weeks&end=2026-10-19")).toEqual({ path: "/weight", search: "view=weeks&end=2026-10-19" });
    window.history.replaceState(null, "", "/?view=all#/weight");
    navigateApp("/weight?view=weeks");
    expect(window.location.search).toBe("");
    expect(window.location.hash).toBe("#/weight?view=weeks");
    navigateApp("/exercises");
    expect(window.location.hash).toBe("#/exercises");
    expect(getReturnPath("from=https%3A%2F%2Fexample.com", "/exercises")).toBe("/exercises");
  });

  it("opens a week and restores the overview window, scroll, and focused row", async () => {
    await saveWeightEntry({ date: "2026-07-01", weightKg: 86 });
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83 });
    renderAt("#/weight");
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Weeks" }));
    await user.click(screen.getByRole("button", { name: "Previous 12 weeks" }));
    const overviewHash = window.location.hash;
    const row = within(screen.getByRole("list", { name: "Weeks" })).getByRole("link", { name: /Jun 29/ });
    vi.stubGlobal("scrollY", 480);
    const scroll = vi.fn((options: ScrollToOptions) => vi.stubGlobal("scrollY", options.top ?? 0));
    vi.stubGlobal("scrollTo", scroll);
    await user.click(row);
    expect(await screen.findByRole("figure", { name: /Daily weight for/ })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Weigh-ins" })).toHaveTextContent("Jul 1");
    await user.click(screen.getByRole("link", { name: "Back to weeks" }));
    expect(window.location.hash).toBe(overviewHash);
    const restored = within(screen.getByRole("list", { name: "Weeks" })).getByRole("link", { name: /Jun 29/ });
    expect(restored).toHaveFocus();
    expect(scroll).toHaveBeenCalledWith({ top: 480, behavior: "instant" });
  });

  it("shows all seven entries across a year boundary and an empty adjacent week", async () => {
    const dates = ["2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"];
    for (const date of dates) await saveWeightEntry({ date, weightKg: 85 });
    renderAt("#/weight?view=week&week=2025-12-29&end=2026-01-05");
    const list = await screen.findByRole("list", { name: "Weigh-ins" });
    expect(within(list).getAllByRole("button")).toHaveLength(7);
    expect(screen.queryByRole("button", { name: /Show all/ })).toBeNull();
    await userEvent.setup().click(screen.getByRole("button", { name: "Next weight week" }));
    expect(await screen.findByText("Nothing logged in this week.")).toBeInTheDocument();
    expect(screen.queryByRole("figure")).toBeNull();
  });

  it("falls back safely for invalid week parameters", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83 });
    renderAt("#/weight?view=week&week=invalid&end=0001-01-01");
    expect(await screen.findByRole("figure", { name: /Oct 19/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Storage is not available" })).toBeNull();
  });

  it("remembers section tabs, periods, and library search when using the top tabs", async () => {
    await saveWeightEntry({ date: "2026-09-01", weightKg: 85 });
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83 });
    await createExercise({ name: "Push-ups", metric: "reps" });
    renderAt("#/weight");
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Previous month" }));
    const weightHash = window.location.hash;
    await user.click(screen.getByRole("link", { name: "Exercises" }));
    await user.click(await screen.findByRole("button", { name: "Library" }));
    await user.type(screen.getByLabelText("Search exercises"), "push");
    await user.click(screen.getByRole("button", { name: "Recent" }));
    await user.click(screen.getByRole("link", { name: "Weight" }));
    expect(window.location.hash).toBe(weightHash);
    await user.click(screen.getByRole("link", { name: "Exercises" }));
    expect(await screen.findByRole("button", { name: "Library", pressed: true })).toBeInTheDocument();
    expect(screen.getByLabelText("Search exercises")).toHaveValue("push");
    expect(screen.getByRole("button", { name: "Recent", pressed: true })).toBeInTheDocument();
  });

  it("returns from exercise progress through its training to the original historical week", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const training = await createTraining({ date: "2026-10-12", name: "Last week" });
    await addSet({ exerciseId: exercise.id, date: training.date, reps: 12, seconds: null, weightKg: null, target: { trainingId: training.id } });
    renderAt("#/exercises?view=week&week=2026-10-12");
    const user = userEvent.setup();
    await user.click(await screen.findByRole("link", { name: "Last week" }));
    await user.click(await screen.findByRole("link", { name: "Push-ups" }));
    await screen.findByRole("heading", { name: "Push-ups" });
    await user.click(screen.getByRole("link", { name: "Training" }));
    await screen.findByRole("heading", { name: "Last week" });
    await user.click(screen.getByRole("link", { name: "Back to week" }));
    expect(await screen.findByRole("link", { name: "Last week" })).toBeInTheDocument();
    expect(new URLSearchParams(window.location.hash.split("?")[1]).get("week")).toBe("2026-10-12");
  });
});
