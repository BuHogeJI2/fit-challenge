import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../components/app";
import { addSet, createExercise, createTraining, db } from "../lib/db";
import { resetDatabase } from "./db-test-utils";

describe("choosing a training", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 19, 9));
    await resetDatabase();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("requires a choice when the date has several trainings", async () => {
    await createExercise({ name: "Push-ups", metric: "reps" });
    await createTraining({ date: "2026-10-19", name: "Morning" });
    const evening = await createTraining({ date: "2026-10-19", name: "Evening" });
    window.location.hash = "#/exercises";
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Log set" }));
    const sheet = screen.getByRole("dialog", { name: "Log set" });
    await user.type(within(sheet).getByLabelText("Reps"), "15");
    expect(within(sheet).getByRole("button", { name: "Morning", pressed: false })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "Evening", pressed: false })).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Choose a training");
    expect(await db.sets.count()).toBe(0);
    await user.click(within(sheet).getByRole("button", { name: "Evening" }));
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    await screen.findByText("Set logged.");
    expect((await db.sets.toArray())[0].trainingId).toBe(evening.id);
  });

  it("keeps a chosen historical training when switching exercises", async () => {
    await createExercise({ name: "Push-ups", metric: "reps" });
    const sitUps = await createExercise({ name: "Sit-ups", metric: "reps" });
    await createTraining({ date: "2026-10-18", name: "Boxing" });
    const home = await createTraining({ date: "2026-10-18", name: "Home" });
    window.location.hash = "#/exercises";
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Log set" }));
    const sheet = screen.getByRole("dialog", { name: "Log set" });
    fireEvent.change(within(sheet).getByLabelText("Date"), { target: { value: "2026-10-18" } });
    await user.click(within(sheet).getByRole("button", { name: "Home" }));
    await user.click(within(sheet).getByRole("button", { name: "Sit-ups" }));
    expect(within(sheet).getByLabelText("Date")).toHaveValue("2026-10-18");
    expect(within(sheet).getByRole("button", { name: "Home", pressed: true })).toBeInTheDocument();
    await user.type(within(sheet).getByLabelText("Reps"), "20");
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    await screen.findByText("Set logged.");
    expect((await db.sets.toArray())[0]).toMatchObject({ exerciseId: sitUps.id, trainingId: home.id });
  });

  it("asks for a training before repeating into an ambiguous day", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: exercise.id, date: "2026-10-18", reps: 12, weightKg: null, seconds: null });
    await createTraining({ date: "2026-10-19", name: "Morning" });
    const evening = await createTraining({ date: "2026-10-19", name: "Evening" });
    window.location.hash = `#/exercises/${exercise.id}`;
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Repeat 12" }));
    const sheet = screen.getByRole("dialog", { name: "Log set" });
    expect(within(sheet).getByLabelText("Reps")).toHaveValue("12");
    expect(await db.sets.count()).toBe(1);
    await user.click(within(sheet).getByRole("button", { name: "Evening" }));
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    await screen.findByText("Oct 19 · 12 reps");
    expect(await db.sets.where("trainingId").equals(evening.id).count()).toBe(1);
  });
});
