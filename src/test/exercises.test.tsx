import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../components/app";
import { addSet, createExercise, db, listSetsForExercise, updateExercise } from "../lib/db";
import { resetDatabase } from "./db-test-utils";

type TUser = ReturnType<typeof userEvent.setup>;

const renderAt = (hash: string) => {
  window.location.hash = hash;
  return render(<App />);
};

const openLogSet = async (user: TUser) => {
  await user.click(await screen.findByRole("button", { name: "Log set" }));
  return screen.getByRole("dialog", { name: "Log set" });
};

const history = () => screen.findByRole("list", { name: "History" });

describe("Exercises mode", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 19, 9, 0, 0));
    await resetDatabase();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("creates the first exercise and opens it", async () => {
    const user = userEvent.setup();
    renderAt("#/exercises");

    expect(await screen.findByText("Add the exercises you train, then log your sets.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "New exercise" }));
    const sheet = screen.getByRole("dialog", { name: "New exercise" });
    await user.type(within(sheet).getByLabelText("Name"), "Push-ups");
    await user.click(within(sheet).getByRole("button", { name: "Add exercise" }));

    expect(await screen.findByRole("heading", { name: "Push-ups" })).toBeInTheDocument();
    expect(window.location.hash).toMatch(/^#\/exercises\/.+/);
    expect(screen.getByText("No sets yet. Log the first one below.")).toBeInTheDocument();
  });

  it("logs a set for each metric type", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    const squat = await createExercise({ name: "Goblet squat", metric: "reps_weight" });
    const plank = await createExercise({ name: "Plank", metric: "time" });
    const user = userEvent.setup();

    const { unmount } = renderAt(`#/exercises/${pushUps.id}`);
    let sheet = await openLogSet(user);
    await user.type(within(sheet).getByLabelText("Reps"), "20");
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    expect(await within(await history()).findByRole("button", { name: "Edit set: 20 reps" })).toBeInTheDocument();
    unmount();

    renderAt(`#/exercises/${squat.id}`);
    sheet = await openLogSet(user);
    await user.type(within(sheet).getByLabelText("Reps"), "12");
    await user.type(within(sheet).getByLabelText("Weight in kg"), "22,5");
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    expect(await within(await history()).findByText("12 × 22.5")).toBeInTheDocument();
    cleanup();

    renderAt(`#/exercises/${plank.id}`);
    sheet = await openLogSet(user);
    await user.type(within(sheet).getByLabelText("Minutes"), "1");
    await user.type(within(sheet).getByLabelText("Seconds"), "45");
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));
    expect(await within(await history()).findByText("1:45")).toBeInTheDocument();
    expect((await listSetsForExercise(plank.id))[0]).toMatchObject({ seconds: 105, reps: null });
  });

  it("rejects input that does not fit the metric", async () => {
    const plank = await createExercise({ name: "Plank", metric: "time" });
    const user = userEvent.setup();
    renderAt(`#/exercises/${plank.id}`);

    const sheet = await openLogSet(user);
    await user.type(within(sheet).getByLabelText("Minutes"), "1");
    await user.type(within(sheet).getByLabelText("Seconds"), "75");
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));

    expect(within(sheet).getByRole("alert")).toHaveTextContent("Enter the time in minutes and seconds");
    expect(await listSetsForExercise(plank.id)).toEqual([]);
  });

  it("prefills from the last set and backdates a set", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-15", reps: 28, weightKg: null, seconds: null });
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);

    const sheet = await openLogSet(user);
    expect(within(sheet).getByLabelText("Reps")).toHaveValue("28");
    expect(within(sheet).getByText(/Last set: Oct 15/)).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "26" }));
    fireEvent.change(within(sheet).getByLabelText("Date"), { target: { value: "2026-10-17" } });
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));

    expect(await within(await history()).findByRole("heading", { name: "Saturday, Oct 17" })).toBeInTheDocument();
  });

  it("repeats the last set today and undoes it", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-15", reps: 28, weightKg: null, seconds: null });
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);

    await user.click(await screen.findByRole("button", { name: "Repeat 28" }));

    expect(await within(await history()).findByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(await listSetsForExercise(pushUps.id)).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await within(await history()).findByRole("heading", { name: /Oct 15/ })).toBeInTheDocument();
    expect(within(await history()).queryByRole("heading", { name: "Today" })).not.toBeInTheDocument();
  });

  it("repeats the last set of a past day into that day and undoes it", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-15", reps: 30, weightKg: null, seconds: null });
    vi.setSystemTime(new Date(2026, 9, 19, 9, 1, 0));
    await addSet({ exerciseId: pushUps.id, date: "2026-10-15", reps: 25, weightKg: null, seconds: null });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-17", reps: 20, weightKg: null, seconds: null });
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);

    await user.click(await screen.findByRole("button", { name: "Repeat 25 reps for Thursday, Oct 15" }));

    expect(await screen.findByText("Logged 25 reps · Oct 15")).toBeInTheDocument();
    expect(within(await history()).queryByRole("heading", { name: "Today" })).not.toBeInTheDocument();
    const sets = await listSetsForExercise(pushUps.id);
    expect(sets.filter((set) => set.date === "2026-10-15").map((set) => set.reps).sort()).toEqual([25, 25, 30]);
    expect(sets.filter((set) => set.date === "2026-10-17")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Undo" }));
    await vi.waitFor(async () => expect(await listSetsForExercise(pushUps.id)).toHaveLength(3));
  });

  it("repeats a weighted set with its own load, not the charted one", async () => {
    const squat = await createExercise({ name: "Goblet squat", metric: "reps_weight" });
    await addSet({ exerciseId: squat.id, date: "2026-10-15", reps: 12, weightKg: 24, seconds: null });
    await addSet({ exerciseId: squat.id, date: "2026-10-17", reps: 15, weightKg: 20, seconds: null });
    await updateExercise(squat.id, { progressWeightKg: 20 });
    const user = userEvent.setup();
    renderAt(`#/exercises/${squat.id}`);

    await user.click(await screen.findByRole("button", { name: "Repeat 12 × 24 kg for Thursday, Oct 15" }));

    expect(await screen.findByText("Logged 12 × 24 kg · Oct 15")).toBeInTheDocument();
    const repeated = (await listSetsForExercise(squat.id)).filter((set) => set.date === "2026-10-15");
    expect(repeated.map(({ reps, weightKg }) => ({ reps, weightKg }))).toEqual([
      { reps: 12, weightKg: 24 },
      { reps: 12, weightKg: 24 },
    ]);
  });

  it("repeats a hold into its own day", async () => {
    const plank = await createExercise({ name: "Plank", metric: "time" });
    await addSet({ exerciseId: plank.id, date: "2026-10-18", reps: null, weightKg: null, seconds: 75 });
    const user = userEvent.setup();
    renderAt(`#/exercises/${plank.id}`);

    await user.click(await screen.findByRole("button", { name: "Repeat 1:15 for Yesterday" }));

    expect(await screen.findByText("Logged 1:15 · Oct 18")).toBeInTheDocument();
    const sets = await listSetsForExercise(plank.id);
    expect(sets.map(({ date, seconds }) => ({ date, seconds }))).toEqual([
      { date: "2026-10-18", seconds: 75 },
      { date: "2026-10-18", seconds: 75 },
    ]);
  });

  it("shows the error and no undo when a day repeat fails", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-15", reps: 25, weightKg: null, seconds: null });
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);
    const repeat = await screen.findByRole("button", { name: "Repeat 25 reps for Thursday, Oct 15" });

    vi.spyOn(db.sets, "add").mockImplementationOnce(
      () => Promise.reject(new Error("disk")) as ReturnType<typeof db.sets.add>,
    );
    await user.click(repeat);

    expect(await screen.findByText("Could not log the set. Nothing was changed.")).toBeInTheDocument();
    expect(screen.queryByText(/^Logged /)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
    expect(await listSetsForExercise(pushUps.id)).toHaveLength(1);
  });

  it("edits a set, deletes it and brings it back", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet({ exerciseId: pushUps.id, date: "2026-10-19", reps: 20, weightKg: null, seconds: null });
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);

    await user.click(await screen.findByRole("button", { name: "Edit set: 20 reps" }));
    let sheet = screen.getByRole("dialog", { name: "Edit set" });
    await user.clear(within(sheet).getByLabelText("Reps"));
    await user.type(within(sheet).getByLabelText("Reps"), "22");
    await user.click(within(sheet).getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("button", { name: "Edit set: 22 reps" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit set: 22 reps" }));
    sheet = screen.getByRole("dialog", { name: "Edit set" });
    await user.click(within(sheet).getByRole("button", { name: "Delete set" }));
    expect(await screen.findByText("Deleted set: 22 reps")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "History" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByRole("button", { name: "Edit set: 22 reps" })).toBeInTheDocument();
    expect(await db.sets.get(set.id)).toMatchObject({ reps: 22, createdAt: set.createdAt });
  });

  it("keeps the metric locked after the last set is deleted", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet({ exerciseId: pushUps.id, date: "2026-10-19", reps: 20, weightKg: null, seconds: null });
    await db.sets.delete(set.id);
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);

    await user.click(await screen.findByRole("button", { name: "Edit" }));
    const sheet = screen.getByRole("dialog", { name: "Edit exercise" });

    expect(within(sheet).getByRole("radio", { name: /Time/ })).toBeDisabled();
    expect(within(sheet).getByText("This is fixed after the first logged set.")).toBeInTheDocument();
  });

  it("archives an exercise and keeps its history", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-19", reps: 20, weightKg: null, seconds: null });
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);

    await user.click(await screen.findByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Archive exercise" }));

    expect(await screen.findByText(/Archived\. Its history is kept/)).toBeInTheDocument();
    expect(within(await history()).getByRole("button", { name: "Edit set: 20 reps" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Log set" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Repeat / })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Training" }));
    expect(await screen.findByText("Archived (1)")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Exercises" })).not.toBeInTheDocument();
  });

  it("charts reps at the selected weight and keeps the sentence in step", async () => {
    const squat = await createExercise({ name: "Goblet squat", metric: "reps_weight" });
    await addSet({ exerciseId: squat.id, date: "2026-10-11", reps: 14, weightKg: 20, seconds: null });
    await addSet({ exerciseId: squat.id, date: "2026-10-18", reps: 12, weightKg: 24, seconds: null });
    const user = userEvent.setup();
    renderAt(`#/exercises/${squat.id}`);

    expect(await screen.findByRole("button", { name: "24 kg", pressed: true })).toBeInTheDocument();
    expect(screen.getByText("Best day 12 reps at 24 kg on Oct 18.")).toBeInTheDocument();
    expect(screen.getByText("Oct 18 · 12 reps at 24 kg")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "20 kg" }));

    expect(await screen.findByText("Oct 11 · 14 reps at 20 kg")).toBeInTheDocument();
    expect(screen.getByText("Best day 14 reps at 20 kg on Oct 11.")).toBeInTheDocument();
    expect((await db.exercises.get(squat.id))?.progressWeightKg).toBe(20);
  });

  it("charts the day total by default and switches to the best set", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-15", reps: 10, weightKg: null, seconds: null });
    for (let index = 0; index < 3; index += 1) {
      await addSet({ exerciseId: pushUps.id, date: "2026-10-19", reps: 10, weightKg: null, seconds: null });
    }
    const user = userEvent.setup();
    renderAt(`#/exercises/${pushUps.id}`);

    expect(await screen.findByRole("button", { name: "Day total", pressed: true })).toBeInTheDocument();
    expect(screen.getByText("Best day 30 reps, up 20 since Oct 15.")).toBeInTheDocument();
    expect(screen.getByText("Oct 19 · 30 reps")).toBeInTheDocument();
    expect(screen.getByRole("figure")).toHaveAccessibleName(/total of each day, 2 days/);

    await user.click(screen.getByRole("button", { name: "Best set" }));

    expect(await screen.findByText("Best set 10 reps, same as Oct 15.")).toBeInTheDocument();
    expect(screen.getByText("Oct 19 · 10 reps")).toBeInTheDocument();
    expect(screen.getByRole("figure")).toHaveAccessibleName(/best of each day, 2 days/);
    expect((await db.exercises.get(pushUps.id))?.progressView).toBe("best");

    await user.click(screen.getByRole("link", { name: "Training" }));
    const list = await screen.findByRole("list", { name: "Exercises" });
    expect(within(list).getByRole("link")).toHaveTextContent("Best set 10 reps, same as Oct 15.");
  });

  it("lists exercises with progress and logs from the list", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    const plank = await createExercise({ name: "Plank", metric: "time" });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-15", reps: 18, weightKg: null, seconds: null });
    await addSet({ exerciseId: pushUps.id, date: "2026-10-19", reps: 29, weightKg: null, seconds: null });
    await addSet({ exerciseId: plank.id, date: "2026-10-13", reps: null, weightKg: null, seconds: 90 });
    const user = userEvent.setup();
    renderAt("#/exercises");

    const list = await screen.findByRole("list", { name: "Exercises" });
    const rows = within(list).getAllByRole("link");
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("Push-ups"),
      expect.stringContaining("Plank"),
    ]);
    expect(rows[0]).toHaveTextContent("today");
    expect(rows[0]).toHaveTextContent(/29 reps/);
    expect(screen.getByText("1 active day this week")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Log set" }));
    const sheet = screen.getByRole("dialog", { name: "Log set" });
    await user.click(within(sheet).getByRole("button", { name: "Plank" }));
    await user.clear(within(sheet).getByLabelText("Minutes"));
    await user.type(within(sheet).getByLabelText("Minutes"), "2");
    await user.clear(within(sheet).getByLabelText("Seconds"));
    await user.click(within(sheet).getByRole("button", { name: "Log set" }));

    expect(await screen.findByText("Set logged.")).toBeInTheDocument();
    expect((await listSetsForExercise(plank.id)).map((set) => set.seconds ?? 0).sort((a, b) => a - b)).toEqual([90, 120]);
  });

  it("shows a not-found state for an unknown exercise", async () => {
    renderAt("#/exercises/missing-id");

    expect(await screen.findByRole("heading", { name: "Not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to training" })).toHaveAttribute("href", "#/exercises");
  });

  it("draws a short hold and low reps without negative ticks", async () => {
    const plank = await createExercise({ name: "Plank", metric: "time" });
    await addSet({ exerciseId: plank.id, date: "2026-10-19", reps: null, weightKg: null, seconds: 5 });
    const { unmount } = renderAt(`#/exercises/${plank.id}`);

    expect(await screen.findByText("Oct 19 · 0:05")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Storage is not available" })).not.toBeInTheDocument();
    unmount();

    const pullUps = await createExercise({ name: "Pull-ups", metric: "reps" });
    await addSet({ exerciseId: pullUps.id, date: "2026-10-18", reps: 1, weightKg: null, seconds: null });
    await addSet({ exerciseId: pullUps.id, date: "2026-10-19", reps: 2, weightKg: null, seconds: null });
    renderAt(`#/exercises/${pullUps.id}`);

    const chart = await screen.findByRole("figure");
    const ticks = Array.from(chart.querySelectorAll("text")).map((node) => node.textContent ?? "");
    expect(ticks.filter((text) => /^-|\u2212/.test(text))).toEqual([]);
  });

  it("falls back to an existing weight when the selected one has no sets left", async () => {
    const squat = await createExercise({ name: "Goblet squat", metric: "reps_weight" });
    await addSet({ exerciseId: squat.id, date: "2026-10-11", reps: 14, weightKg: 20, seconds: null });
    const heavy = await addSet({ exerciseId: squat.id, date: "2026-10-18", reps: 12, weightKg: 24, seconds: null });
    await updateExercise(squat.id, { progressWeightKg: 24 });
    const user = userEvent.setup();
    renderAt(`#/exercises/${squat.id}`);

    await user.click(await screen.findByRole("button", { name: "Edit set: 12 × 24 kg" }));
    await user.click(within(screen.getByRole("dialog", { name: "Edit set" })).getByRole("button", { name: "Delete set" }));

    expect(await screen.findByText("Best day 14 reps at 20 kg on Oct 11.")).toBeInTheDocument();
    expect(screen.getByText("Oct 11 · 14 reps at 20 kg")).toBeInTheDocument();
    expect(await db.sets.get(heavy.id)).toBeUndefined();
  });

  it("follows an edited set to its new weight when the old one is gone", async () => {
    const squat = await createExercise({ name: "Goblet squat", metric: "reps_weight" });
    await addSet({ exerciseId: squat.id, date: "2026-10-11", reps: 14, weightKg: 20, seconds: null });
    await addSet({ exerciseId: squat.id, date: "2026-10-18", reps: 12, weightKg: 24, seconds: null });
    await updateExercise(squat.id, { progressWeightKg: 24 });
    const user = userEvent.setup();
    renderAt(`#/exercises/${squat.id}`);

    await user.click(await screen.findByRole("button", { name: "Edit set: 12 × 24 kg" }));
    const sheet = screen.getByRole("dialog", { name: "Edit set" });
    await user.clear(within(sheet).getByLabelText("Weight in kg"));
    await user.type(within(sheet).getByLabelText("Weight in kg"), "22");
    await user.click(within(sheet).getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Best day 12 reps at 22 kg on Oct 18.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "22 kg", pressed: true })).toBeInTheDocument();
  });

  it("highlights the best set at the selected weight only", async () => {
    const squat = await createExercise({ name: "Goblet squat", metric: "reps_weight" });
    await addSet({ exerciseId: squat.id, date: "2026-10-19", reps: 15, weightKg: 20, seconds: null });
    await addSet({ exerciseId: squat.id, date: "2026-10-19", reps: 12, weightKg: 24, seconds: null });
    await updateExercise(squat.id, { progressWeightKg: 24 });
    renderAt(`#/exercises/${squat.id}`);

    const heavy = await screen.findByRole("button", { name: "Edit set: 12 × 24 kg" });
    const light = screen.getByRole("button", { name: "Edit set: 15 × 20 kg" });
    expect(heavy.className).toContain("font-semibold");
    expect(light.className).not.toContain("font-semibold");
  });
});
