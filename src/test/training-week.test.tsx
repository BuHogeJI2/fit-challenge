import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../components/app";
import { addSet, createExercise, createTraining, db } from "../lib/db";
import { resetDatabase } from "./db-test-utils";

const seed = async () => {
  const boxing = await createExercise({ name: "Boxing", metric: "session" });
  const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
  const training = await createTraining({ date: "2026-10-19", name: "Morning boxing" });
  await addSet({ exerciseId: boxing.id, date: training.date, reps: null, seconds: null, weightKg: null, target: { trainingId: training.id } });
  await addSet({ exerciseId: pushUps.id, date: training.date, reps: 20, seconds: null, weightKg: null, note: "After sparring", target: { trainingId: training.id } });
  return { training, boxing, pushUps };
};

const renderAt = (hash = "#/exercises") => {
  window.location.hash = hash;
  render(<App />);
};

describe("weekly training journal", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 19, 9));
    await resetDatabase();
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("shows trainings and their attached exercises, with separate session counts", async () => {
    const { training, boxing } = await seed();
    const swimming = await createExercise({ name: "Swimming", metric: "session" });
    await addSet({ exerciseId: boxing.id, date: training.date, reps: null, seconds: null, weightKg: null, target: { newTraining: true } });
    await addSet({ exerciseId: swimming.id, date: training.date, reps: null, seconds: null, weightKg: null, target: { newTraining: true } });
    renderAt();
    const list = await screen.findByRole("list", { name: "Weekly trainings" });
    expect(screen.getByRole("button", { name: "Week", pressed: true })).toBeInTheDocument();
    expect(screen.getByText("3 trainings")).toBeInTheDocument();
    expect(screen.getByText("Boxing ×2 · Swimming ×1")).toBeInTheDocument();
    const morning = within(list).getByRole("link", { name: "Morning boxing" }).closest("li")!;
    expect(morning).toHaveTextContent("Push-ups1 set · 20 reps");
    expect(morning).not.toHaveTextContent("Swimming");
    await userEvent.setup().click(within(morning).getByRole("link", { name: "Morning boxing" }));
    expect(await screen.findByRole("heading", { name: "Morning boxing" })).toBeInTheDocument();
    expect(screen.getByText("After sparring")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exercises" })).toHaveAttribute("aria-current", "page");
  });

  it("adds from a training with the target and date fixed", async () => {
    const { training } = await seed();
    renderAt(`#/trainings/${training.id}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Add exercise" }));
    const sheet = screen.getByRole("dialog", { name: /Log/ });
    expect(within(sheet).getByLabelText("Date")).toBeDisabled();
    expect(within(sheet).getByRole("button", { name: "Morning boxing", pressed: true })).toBeDisabled();
    expect(within(sheet).queryByRole("button", { name: "New training" })).toBeNull();
    await user.click(within(sheet).getByRole("button", { name: "Push-ups" }));
    await user.clear(within(sheet).getByLabelText("Reps"));
    await user.type(within(sheet).getByLabelText("Reps"), "15");
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    await screen.findByText("Entry saved.");
    expect(await db.sets.where("trainingId").equals(training.id).count()).toBe(3);
    expect(await db.trainings.count()).toBe(1);
  });

  it("moves every entry when editing the training date, and deletes and restores the group", async () => {
    const { training } = await seed();
    renderAt(`#/trainings/${training.id}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Edit training" }));
    const form = screen.getByRole("dialog", { name: "Edit training" });
    fireEvent.change(within(form).getByLabelText("Date"), { target: { value: "2026-10-18" } });
    await user.click(within(form).getByRole("button", { name: "Save training" }));
    await screen.findByText("Training saved.");
    expect((await db.sets.toArray()).every((set) => set.date === "2026-10-18")).toBe(true);
    await user.click(screen.getByRole("button", { name: "Edit training" }));
    await user.click(within(screen.getByRole("dialog", { name: "Edit training" })).getByRole("button", { name: "Delete training and 2 entries" }));
    await screen.findByText("Training and its entries deleted.");
    expect(await db.sets.count()).toBe(0);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    await screen.findByRole("heading", { name: "Morning boxing" });
    expect(await db.sets.count()).toBe(2);
    expect((await db.trainings.get(training.id))?.date).toBe("2026-10-18");
  });

  it("splits an old day by moving an entry to a new training", async () => {
    const { training, pushUps } = await seed();
    renderAt(`#/trainings/${training.id}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Edit Push-ups: 20 reps" }));
    const form = screen.getByRole("dialog", { name: "Edit set" });
    await user.click(within(form).getByRole("button", { name: "New training" }));
    await user.click(within(form).getByRole("button", { name: "Save" }));
    await screen.findByText("Entry saved.");
    expect(await db.trainings.count()).toBe(2);
    const moved = await db.sets.where("exerciseId").equals(pushUps.id).first();
    expect(moved?.trainingId).not.toBe(training.id);
    expect(moved?.note).toBe("After sparring");
  });

  it("lists the library A–Z and browses historical weeks", async () => {
    await seed();
    await createExercise({ name: "Plank", metric: "time" });
    await createTraining({ date: "2026-10-12", name: "Last week" });
    renderAt();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Previous training week" }));
    expect(await screen.findByRole("link", { name: "Last week" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Morning boxing" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "This week" }));
    await user.click(screen.getByRole("button", { name: "Library" }));
    const list = screen.getByRole("list", { name: "Exercises" });
    expect(within(list).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "BoxingToday · 1 session in 4 weeks›",
      "PlankNo sets yet›",
      "Push-upsToday · 1 set · 20 reps›",
    ]);
    expect(screen.queryByLabelText("Search exercises")).toBeNull();
    expect(screen.getByRole("button", { name: "New exercise" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.queryByRole("button", { name: "New exercise" })).toBeNull();
  });

  it("returns to the week after deleting the last unnamed entry, and Undo reopens it", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet({ exerciseId: pushUps.id, date: "2026-10-19", reps: 12, weightKg: null, seconds: null });
    renderAt(`#/trainings/${set.trainingId}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Edit Push-ups: 12 reps" }));
    await user.click(within(screen.getByRole("dialog", { name: "Edit set" })).getByRole("button", { name: "Delete set" }));
    await screen.findByText("Entry deleted.");
    expect(await screen.findByRole("heading", { name: "Oct 19 – 25" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Training not found" })).toBeNull();
    expect(await db.trainings.count()).toBe(0);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByRole("button", { name: "Edit Push-ups: 12 reps" })).toBeInTheDocument();
    expect(await db.trainings.count()).toBe(1);
  });
});
