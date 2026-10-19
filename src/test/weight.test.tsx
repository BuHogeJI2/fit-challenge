import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../components/app";
import { db, listWeightEntries, saveWeightEntry } from "../lib/db";
import { resetDatabase } from "./db-test-utils";

const renderWeight = () => {
  window.location.hash = "#/weight";
  return render(<App />);
};

const openLogSheet = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole("button", { name: "Log weight" }));
  return screen.getByRole("dialog", { name: "Log weight" });
};

describe("Weight mode", () => {
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

  it("starts the journal from the first-use form", async () => {
    const user = userEvent.setup();
    renderWeight();

    expect(await screen.findByText("No weigh-ins yet")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Weight in kg"), "83,4");
    await user.click(screen.getByRole("button", { name: "Start the journal" }));

    expect(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" })).toBeInTheDocument();
    expect(screen.getByText("The line starts with your second weigh-in.")).toBeInTheDocument();
    expect(await listWeightEntries()).toEqual([
      expect.objectContaining({ date: "2026-10-19", weightKg: 83.4 }),
    ]);
  });

  it("asks for a valid weight and saves nothing", async () => {
    const user = userEvent.setup();
    renderWeight();

    await user.type(await screen.findByLabelText("Weight in kg"), "abc");
    await user.click(screen.getByRole("button", { name: "Start the journal" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter your weight, for example 83.4.");
    expect(await listWeightEntries()).toEqual([]);
  });

  it("logs a second entry on another date and shows the change", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderWeight();

    const sheet = await openLogSheet(user);
    fireEvent.change(within(sheet).getByLabelText("Date"), { target: { value: "2026-10-17" } });
    await user.type(within(sheet).getByLabelText("Weight in kg"), "84");
    await user.click(within(sheet).getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("button", { name: "Edit Oct 17, 84.0 kg" })).toHaveTextContent("first");
    expect(screen.getByRole("button", { name: "Edit Oct 19, 83.4 kg" })).toHaveTextContent("−0.6");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("warns and replaces the entry when the date already has one", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderWeight();

    const sheet = await openLogSheet(user);
    expect(within(sheet).getByText("Replaces the entry for Oct 19 (83.4 kg).")).toBeInTheDocument();
    await user.type(within(sheet).getByLabelText("Weight in kg"), "83.1");
    await user.click(within(sheet).getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("button", { name: "Edit Oct 19, 83.1 kg" })).toBeInTheDocument();
    expect(await listWeightEntries()).toHaveLength(1);
  });

  it("moves an edited entry onto a taken date", async () => {
    await saveWeightEntry({ date: "2026-10-18", weightKg: 83.4 });
    await saveWeightEntry({ date: "2026-10-17", weightKg: 83.9 });
    const user = userEvent.setup();
    renderWeight();

    await user.click(await screen.findByRole("button", { name: "Edit Oct 18, 83.4 kg" }));
    const sheet = screen.getByRole("dialog", { name: "Edit weigh-in" });
    fireEvent.change(within(sheet).getByLabelText("Date"), { target: { value: "2026-10-17" } });
    expect(within(sheet).getByText("Replaces the entry for Oct 17 (83.9 kg).")).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("button", { name: "Edit Oct 17, 83.4 kg" })).toBeInTheDocument();
    expect(await listWeightEntries()).toEqual([
      expect.objectContaining({ date: "2026-10-17", weightKg: 83.4 }),
    ]);
  });

  it("deletes an entry and brings it back with undo", async () => {
    const entry = await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4, note: "morning" });
    await saveWeightEntry({ date: "2026-10-17", weightKg: 83.9 });
    const user = userEvent.setup();
    renderWeight();

    await user.click(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" }));
    await user.click(screen.getByRole("button", { name: "Delete entry" }));

    expect(await screen.findByText("Deleted Oct 19, 83.4 kg")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Oct 19, 83.4 kg" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" })).toBeInTheDocument();
    expect(await db.weightEntries.get(entry.id)).toEqual(entry);
  });

  it("refuses undo when a newer entry took the date", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderWeight();

    await user.click(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" }));
    await user.click(screen.getByRole("button", { name: "Delete entry" }));
    await screen.findByText("Deleted Oct 19, 83.4 kg");

    await saveWeightEntry({ date: "2026-10-19", weightKg: 82.9 });
    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(await screen.findByText("Undo is no longer available.")).toBeInTheDocument();
    expect(await listWeightEntries()).toEqual([
      expect.objectContaining({ date: "2026-10-19", weightKg: 82.9 }),
    ]);
  });

  it("navigates between months and keeps the current month as the last one", async () => {
    await saveWeightEntry({ date: "2026-09-20", weightKg: 84.2 });
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderWeight();

    expect(await screen.findByRole("heading", { name: "October" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Edit Sep 20, 84.2 kg" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous month" }));

    expect(screen.getByRole("heading", { name: "September" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Sep 20, 84.2 kg" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(screen.getByRole("heading", { name: "All time" })).toBeInTheDocument();
    expect(screen.getByText("2 weigh-ins since Sep 20")).toBeInTheDocument();
  });

  it("shows the selected point as text", async () => {
    await saveWeightEntry({ date: "2026-10-14", weightKg: 83.1 });
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    renderWeight();

    expect(await screen.findByText("Oct 19 · 83.4 kg")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("chart-point-2026-10-14"));
    expect(screen.getByText("Oct 14 · 83.1 kg")).toBeInTheDocument();
  });

  it("shows the storage error when the database cannot open", async () => {
    vi.spyOn(db, "open").mockRejectedValueOnce(new Error("blocked by the browser"));
    renderWeight();

    expect(await screen.findByRole("heading", { name: "Storage is not available" })).toBeInTheDocument();
    expect(screen.getByText("blocked by the browser")).toBeInTheDocument();
  });

  it("keeps the sheet open with an error when deleting fails", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    vi.spyOn(db.weightEntries, "delete").mockImplementationOnce(
      () => Promise.reject(new Error("disk")) as ReturnType<typeof db.weightEntries.delete>,
    );
    const user = userEvent.setup();
    renderWeight();

    await user.click(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" }));
    await user.click(screen.getByRole("button", { name: "Delete entry" }));

    const sheet = screen.getByRole("dialog", { name: "Edit weigh-in" });
    expect(await within(sheet).findByRole("alert")).toHaveTextContent(
      "Could not delete. Nothing was changed.",
    );
    expect(await listWeightEntries()).toHaveLength(1);
  });

  it("shows an error when undo fails to write", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderWeight();

    await user.click(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" }));
    await user.click(screen.getByRole("button", { name: "Delete entry" }));
    await screen.findByText("Deleted Oct 19, 83.4 kg");

    vi.spyOn(db.weightEntries, "add").mockImplementationOnce(
      () => Promise.reject(new Error("disk")) as ReturnType<typeof db.weightEntries.add>,
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(await screen.findByText("Could not undo. Nothing was changed.")).toBeInTheDocument();
    expect(await listWeightEntries()).toEqual([]);
  });

  it("shows the storage error when reading fails after the database opened", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(db.settings, "toArray").mockImplementation(
      () => Promise.reject(new Error("read failed")) as ReturnType<typeof db.settings.toArray>,
    );
    renderWeight();

    expect(await screen.findByRole("heading", { name: "Storage is not available" })).toBeInTheDocument();
    expect(screen.getByText("read failed")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exercises" })).toBeInTheDocument();
  });

  it("shows the month of a backdated first entry", async () => {
    const user = userEvent.setup();
    renderWeight();

    fireEvent.change(await screen.findByLabelText("Date"), { target: { value: "2026-09-19" } });
    await user.type(screen.getByLabelText("Weight in kg"), "84.1");
    await user.click(screen.getByRole("button", { name: "Start the journal" }));

    expect(await screen.findByRole("heading", { name: "September" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Sep 19, 84.1 kg" })).toBeInTheDocument();
  });

  it("rejects a future date", async () => {
    const user = userEvent.setup();
    renderWeight();

    fireEvent.change(await screen.findByLabelText("Date"), { target: { value: "2026-10-20" } });
    await user.type(screen.getByLabelText("Weight in kg"), "83.4");
    await user.click(screen.getByRole("button", { name: "Start the journal" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Pick today or an earlier date.");
    expect(await listWeightEntries()).toEqual([]);
  });

  it("moves the chart selection with the arrow keys", async () => {
    await saveWeightEntry({ date: "2026-10-14", weightKg: 83.1 });
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderWeight();

    const chart = await screen.findByRole("figure");
    chart.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("Oct 14 · 83.1 kg")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("Oct 14 · 83.1 kg")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Oct 19 · 83.4 kg")).toBeInTheDocument();
  });

  it("shows the year for entries from another year", async () => {
    await saveWeightEntry({ date: "2025-12-30", weightKg: 88 });
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderWeight();

    await user.click(await screen.findByRole("button", { name: "All" }));

    expect(screen.getByRole("button", { name: "Edit Dec 30, 2025, 88.0 kg" })).toBeInTheDocument();
    expect(screen.getByText("2 weigh-ins since Dec 30, 2025")).toBeInTheDocument();
  });
});
