import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../components/app";
import { exportData, restoreBackup, serializeBackup } from "../lib/backup";
import {
  addSet,
  createExercise,
  db,
  getSettings,
  listWeightEntries,
  saveWeightEntry,
} from "../lib/db";
import { resetDatabase } from "./db-test-utils";

const renderAt = (hash: string) => {
  window.location.hash = hash;
  return render(<App />);
};

const backupFile = (text: string, name = "fit-2026-10-18.json") =>
  new File([text], name, { type: "application/json" });

describe("Settings", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 19, 9, 0, 0));
    await resetDatabase();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("saves and clears the goal weight", async () => {
    const user = userEvent.setup();
    renderAt("#/settings");

    const goal = await screen.findByLabelText("Goal weight, kg");
    await user.type(goal, "79,5");
    await user.click(screen.getByRole("button", { name: "Save goal" }));
    expect(await screen.findByText("Goal saved.")).toBeInTheDocument();
    expect((await getSettings()).goalWeightKg).toBe(79.5);

    await user.clear(goal);
    await user.click(screen.getByRole("button", { name: "Save goal" }));
    expect(await screen.findByText("Goal cleared.")).toBeInTheDocument();
    expect((await getSettings()).goalWeightKg).toBeNull();
  });

  it("rejects an invalid goal", async () => {
    const user = userEvent.setup();
    renderAt("#/settings");

    await user.type(await screen.findByLabelText("Goal weight, kg"), "abc");
    await user.click(screen.getByRole("button", { name: "Save goal" }));

    expect(screen.getByText("Enter a weight like 80 or 79.5, or leave it empty.")).toBeInTheDocument();
    expect((await getSettings()).goalWeightKg).toBeNull();
  });

  it("exports a backup file and remembers the export date", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const createObjectURL = vi.fn(() => "blob:backup");
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();
    renderAt("#/settings");

    expect(await screen.findByText("No backup exported yet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Export backup" }));

    expect(await screen.findByText("Saved fit-2026-10-19.json.")).toBeInTheDocument();
    expect(click).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Last export: today")).toBeInTheDocument();
  });

  it("shows why a file cannot be restored and changes nothing", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderAt("#/settings");

    await user.upload(await screen.findByLabelText("Restore from a file"), backupFile("{not json"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("fit-2026-10-18.json cannot be restored");
    expect(alert).toHaveTextContent("Nothing was changed.");
    expect(await listWeightEntries()).toHaveLength(1);
  });

  it("previews a backup and replaces the data after confirmation", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet({ exerciseId: exercise.id, date: "2026-10-18", reps: 20, weightKg: null, seconds: null });
    await saveWeightEntry({ date: "2026-10-18", weightKg: 84 });
    await saveWeightEntry({ date: "2026-10-17", weightKg: 84.2 });
    const text = serializeBackup(await exportData());

    await resetDatabase();
    await saveWeightEntry({ date: "2026-10-19", weightKg: 90 });

    const user = userEvent.setup();
    renderAt("#/settings");
    await user.upload(await screen.findByLabelText("Restore from a file"), backupFile(text));

    const preview = await screen.findByRole("region", { name: "Restore preview" });
    expect(preview).toHaveTextContent("fit-2026-10-18.json");
    expect(preview).toHaveTextContent("2 weigh-ins, 1 exercise, 1 set, 0 settings.");
    expect(await listWeightEntries()).toHaveLength(1);

    await user.click(within(preview).getByRole("button", { name: "Replace my data" }));

    expect(await screen.findByText("Backup restored.")).toBeInTheDocument();
    expect((await listWeightEntries()).map((entry) => entry.date)).toEqual([
      "2026-10-17",
      "2026-10-18",
    ]);
    expect(await db.sets.count()).toBe(1);
  });

  it("deletes all data after confirmation", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const user = userEvent.setup();
    renderAt("#/settings");

    await user.click(await screen.findByRole("button", { name: "Delete all data" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await listWeightEntries()).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Delete all data" }));
    await user.click(screen.getByRole("button", { name: "Delete everything" }));

    expect(await screen.findByText("All data deleted from this device.")).toBeInTheDocument();
    expect(await listWeightEntries()).toEqual([]);
  });

  it("drops an open undo toast and sheet when the data is replaced", async () => {
    await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    await saveWeightEntry({ date: "2026-10-18", weightKg: 83.6 });
    const backup = await exportData();
    const user = userEvent.setup();
    renderAt("#/weight");

    await user.click(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" }));
    await user.click(screen.getByRole("button", { name: "Delete entry" }));
    expect(await screen.findByRole("button", { name: "Undo" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit Oct 18, 83.6 kg" }));
    expect(screen.getByRole("dialog", { name: "Edit weigh-in" })).toBeInTheDocument();

    await restoreBackup(backup.data);

    expect(await screen.findByRole("button", { name: "Edit Oct 19, 83.4 kg" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains when the browser does not report storage status", async () => {
    vi.stubGlobal("navigator", { ...navigator, storage: undefined });
    renderAt("#/settings");

    expect(
      await screen.findByText("This browser does not report whether it keeps the data. Export backups."),
    ).toBeInTheDocument();
  });

  it("asks the browser to keep the data", async () => {
    const persist = vi.fn(async () => true);
    vi.stubGlobal("navigator", {
      ...navigator,
      storage: { persisted: vi.fn(async () => false), persist },
    });
    const user = userEvent.setup();
    renderAt("#/settings");

    await user.click(await screen.findByRole("button", { name: "Ask to keep data" }));

    expect(persist).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("This browser has promised to keep the data until you delete it."),
    ).toBeInTheDocument();
  });

  it("uses only the latest selected file when reads finish out of order", async () => {
    await saveWeightEntry({ date: "2026-10-10", weightKg: 85 });
    const older = serializeBackup(await exportData());
    await saveWeightEntry({ date: "2026-10-11", weightKg: 84.8 });
    const newer = serializeBackup(await exportData());
    await resetDatabase();

    const resolvers = new Map<string, (text: string) => void>();
    const pendingFile = (name: string) => {
      const file = new File(["{}"], name, { type: "application/json" });
      Object.defineProperty(file, "text", {
        value: () => new Promise<string>((resolve) => resolvers.set(name, resolve)),
      });
      return file;
    };

    const user = userEvent.setup();
    renderAt("#/settings");
    const input = await screen.findByLabelText("Restore from a file");

    await user.upload(input, pendingFile("older.json"));
    await user.upload(input, pendingFile("newer.json"));
    expect(screen.getByText("Checking newer.json…")).toBeInTheDocument();

    resolvers.get("newer.json")!(newer);
    const preview = await screen.findByRole("region", { name: "Restore preview" });
    expect(preview).toHaveTextContent("newer.json");

    resolvers.get("older.json")!(older);
    await Promise.resolve();
    expect(screen.getByRole("region", { name: "Restore preview" })).toHaveTextContent("2 weigh-ins");

    await user.click(within(preview).getByRole("button", { name: "Replace my data" }));
    expect(await screen.findByText("Backup restored.")).toBeInTheDocument();
    expect(await listWeightEntries()).toHaveLength(2);
  });

  it("hides the previous preview while a new file is being read", async () => {
    await saveWeightEntry({ date: "2026-10-10", weightKg: 85 });
    const text = serializeBackup(await exportData());
    const user = userEvent.setup();
    renderAt("#/settings");
    const input = await screen.findByLabelText("Restore from a file");

    await user.upload(input, backupFile(text, "first.json"));
    expect(await screen.findByRole("region", { name: "Restore preview" })).toBeInTheDocument();

    const pending = new File(["{}"], "second.json", { type: "application/json" });
    Object.defineProperty(pending, "text", { value: () => new Promise<string>(() => {}) });
    await user.upload(input, pending);

    expect(screen.queryByRole("region", { name: "Restore preview" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Replace my data" })).not.toBeInTheDocument();
  });

  it("ignores a late read failure after a newer file succeeded", async () => {
    await saveWeightEntry({ date: "2026-10-10", weightKg: 85 });
    const text = serializeBackup(await exportData());
    let rejectOlder: (error: Error) => void = () => {};
    const older = new File(["{}"], "older.json", { type: "application/json" });
    Object.defineProperty(older, "text", {
      value: () => new Promise<string>((_, reject) => (rejectOlder = reject)),
    });
    const user = userEvent.setup();
    renderAt("#/settings");
    const input = await screen.findByLabelText("Restore from a file");

    await user.upload(input, older);
    await user.upload(input, backupFile(text, "newer.json"));
    expect(await screen.findByRole("region", { name: "Restore preview" })).toBeInTheDocument();

    rejectOlder(new Error("read failed"));
    await Promise.resolve();
    expect(screen.getByRole("region", { name: "Restore preview" })).toHaveTextContent("newer.json");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
