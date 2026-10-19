import { beforeEach, describe, expect, it } from "vitest";
import {
  bumpDataGeneration,
  db,
  deleteWeightEntry,
  listWeightEntries,
  restoreWeightEntry,
  saveWeightEntry,
} from "../lib/db";
import { resetDatabase } from "./db-test-utils";

describe("weight repository", () => {
  beforeEach(resetDatabase);

  it("creates an entry with a rounded value and a trimmed note", async () => {
    const entry = await saveWeightEntry({
      date: "2026-10-19",
      weightKg: 83.44,
      note: "  before breakfast ",
    });

    expect(entry).toMatchObject({
      date: "2026-10-19",
      weightKg: 83.4,
      note: "before breakfast",
    });
    expect(await listWeightEntries()).toEqual([entry]);
  });

  it("replaces the entry on the same date and keeps its id and createdAt", async () => {
    const first = await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const second = await saveWeightEntry({ date: "2026-10-19", weightKg: 83.1, note: "evening" });

    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(await listWeightEntries()).toEqual([
      expect.objectContaining({ id: first.id, weightKg: 83.1, note: "evening" }),
    ]);
  });

  it("moves an entry to a free date", async () => {
    const entry = await saveWeightEntry({ date: "2026-10-18", weightKg: 83.4 });

    await saveWeightEntry({ date: "2026-10-17", weightKg: 83.4 }, entry.id);

    expect(await listWeightEntries()).toEqual([
      expect.objectContaining({ id: entry.id, date: "2026-10-17" }),
    ]);
  });

  it("moves an entry onto a taken date by replacing the other entry", async () => {
    const moved = await saveWeightEntry({ date: "2026-10-18", weightKg: 83.4 });
    await saveWeightEntry({ date: "2026-10-17", weightKg: 83.9 });

    await saveWeightEntry({ date: "2026-10-17", weightKg: 83.4 }, moved.id);

    expect(await listWeightEntries()).toEqual([
      expect.objectContaining({ id: moved.id, date: "2026-10-17", weightKg: 83.4 }),
    ]);
  });

  it("rejects invalid input without writing", async () => {
    await expect(saveWeightEntry({ date: "2026-02-30", weightKg: 80 })).rejects.toMatchObject({
      code: "invalid_input",
    });
    await expect(saveWeightEntry({ date: "2026-10-19", weightKg: 0 })).rejects.toMatchObject({
      code: "invalid_input",
    });
    await expect(
      saveWeightEntry({ date: "2026-10-19", weightKg: 80 }, "missing-id"),
    ).rejects.toMatchObject({ code: "not_found" });
    expect(await listWeightEntries()).toEqual([]);
  });

  it("restores a deleted entry unchanged when its date is still free", async () => {
    const entry = await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const undo = await deleteWeightEntry(entry.id);

    expect(undo).toEqual({ record: entry, generation: 0 });
    expect(await restoreWeightEntry(undo!)).toBe(true);
    expect(await listWeightEntries()).toEqual([entry]);
  });

  it("does not restore over a newer entry on the same date", async () => {
    const entry = await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const undo = (await deleteWeightEntry(entry.id))!;
    const newer = await saveWeightEntry({ date: "2026-10-19", weightKg: 82.9 });

    expect(await restoreWeightEntry(undo)).toBe(false);
    expect(await listWeightEntries()).toEqual([newer]);
  });

  it("does not restore after the data generation changed", async () => {
    const entry = await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const undo = (await deleteWeightEntry(entry.id))!;

    await db.transaction("rw", db.meta, bumpDataGeneration);

    expect(await restoreWeightEntry(undo)).toBe(false);
    expect(await listWeightEntries()).toEqual([]);
  });

  it("does not restore when a wipe started first and commits during the undo", async () => {
    const entry = await saveWeightEntry({ date: "2026-10-19", weightKg: 83.4 });
    const undo = (await deleteWeightEntry(entry.id))!;

    const wipe = db.transaction("rw", db.weightEntries, db.meta, async () => {
      await db.weightEntries.clear();
      await bumpDataGeneration();
    });
    const restored = restoreWeightEntry(undo);
    await wipe;

    expect(await restored).toBe(false);
    expect(await listWeightEntries()).toEqual([]);
  });

  it("validates the weight after rounding", async () => {
    await expect(saveWeightEntry({ date: "2026-10-19", weightKg: 0.01 })).rejects.toMatchObject({
      code: "invalid_input",
    });
    await expect(
      saveWeightEntry({ date: "2026-10-19", weightKg: Number.MAX_VALUE }),
    ).rejects.toMatchObject({ code: "invalid_input" });
    expect(await listWeightEntries()).toEqual([]);
  });

  it("does not remove the entry on a taken date when the moved value is invalid", async () => {
    const moved = await saveWeightEntry({ date: "2026-10-18", weightKg: 83.4 });
    const other = await saveWeightEntry({ date: "2026-10-17", weightKg: 83.9 });

    await expect(
      saveWeightEntry({ date: "2026-10-17", weightKg: 0.04 }, moved.id),
    ).rejects.toMatchObject({ code: "invalid_input" });
    expect(await listWeightEntries()).toEqual([other, moved]);
  });

  it("returns null when deleting a missing entry", async () => {
    expect(await deleteWeightEntry("missing-id")).toBeNull();
  });
});
