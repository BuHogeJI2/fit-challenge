import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addSet,
  addSetWithUndo,
  archiveExercise,
  archiveExerciseWithUndo,
  bumpDataGeneration,
  createExercise,
  db,
  deleteSet,
  getExercise,
  listSetsForExercise,
  restoreSet,
  unarchiveExercise,
  undoAddSet,
  undoArchiveExercise,
  updateExercise,
  updateSet,
} from "../lib/db";
import { resetDatabase } from "./db-test-utils";

const repsSet = (exerciseId: string, reps: number, date = "2026-10-19") => ({
  exerciseId,
  date,
  reps,
  weightKg: null,
  seconds: null,
});

describe("exercise and set repositories", () => {
  beforeEach(resetDatabase);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an exercise with a normalized name and an unlocked metric", async () => {
    const exercise = await createExercise({ name: "  Push-ups  ", metric: "reps" });

    expect(exercise).toMatchObject({
      name: "Push-ups",
      metric: "reps",
      metricLockedAt: null,
      archivedAt: null,
    });
  });

  it("rejects an empty name", async () => {
    await expect(createExercise({ name: "   ", metric: "reps" })).rejects.toMatchObject({
      code: "invalid_input",
    });
  });

  it("allows a metric change until the first set and never after", async () => {
    const exercise = await createExercise({ name: "Squat", metric: "reps" });
    await updateExercise(exercise.id, { metric: "reps_weight" });

    const set = await addSet({
      exerciseId: exercise.id,
      date: "2026-10-19",
      reps: 12,
      weightKg: 24,
      seconds: null,
    });
    await deleteSet(set.id);

    expect((await getExercise(exercise.id))?.metricLockedAt).not.toBeNull();
    await expect(updateExercise(exercise.id, { metric: "reps" })).rejects.toMatchObject({
      code: "metric_locked",
    });
  });

  it("checks set values against the metric", async () => {
    const plank = await createExercise({ name: "Plank", metric: "time" });

    await expect(addSet(repsSet(plank.id, 10))).rejects.toMatchObject({
      code: "invalid_input",
    });
    await expect(
      addSet({ exerciseId: plank.id, date: "2026-10-19", reps: null, weightKg: null, seconds: 1.5 }),
    ).rejects.toMatchObject({ code: "invalid_input" });
    await expect(
      addSet({ exerciseId: plank.id, date: "2026-10-19", reps: null, weightKg: null, seconds: 105 }),
    ).resolves.toMatchObject({ seconds: 105 });
  });

  it("does not lock the metric when the first set is rejected", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });

    await expect(addSet(repsSet(exercise.id, 0))).rejects.toMatchObject({
      code: "invalid_input",
    });
    expect((await getExercise(exercise.id))?.metricLockedAt).toBeNull();
  });

  it("keeps sets when an exercise is archived and blocks new ones", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    await addSet(repsSet(exercise.id, 20));

    await archiveExercise(exercise.id);

    expect(await listSetsForExercise(exercise.id)).toHaveLength(1);
    await expect(addSet(repsSet(exercise.id, 21))).rejects.toMatchObject({ code: "archived" });

    await unarchiveExercise(exercise.id);
    await expect(addSet(repsSet(exercise.id, 21))).resolves.toMatchObject({ reps: 21 });
  });

  it("updates a set's values, date and note", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet(repsSet(exercise.id, 20));

    const updated = await updateSet(set.id, {
      date: "2026-10-18",
      reps: 22,
      weightKg: null,
      seconds: null,
      note: "slow",
    });

    expect(updated).toMatchObject({ id: set.id, date: "2026-10-18", reps: 22, note: "slow" });
    expect(updated.createdAt).toBe(set.createdAt);
  });

  it("restores a deleted set unchanged", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet(repsSet(exercise.id, 20));
    const undo = (await deleteSet(set.id))!;

    expect(await restoreSet(undo)).toBe(true);
    expect(await listSetsForExercise(exercise.id)).toEqual([set]);
  });

  it("does not restore a set whose exercise is gone or no longer fits", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet(repsSet(exercise.id, 20));
    const undo = (await deleteSet(set.id))!;

    await db.exercises.update(exercise.id, { metric: "time" });
    expect(await restoreSet(undo)).toBe(false);

    await db.exercises.delete(exercise.id);
    expect(await restoreSet(undo)).toBe(false);
    expect(await db.sets.count()).toBe(0);
  });

  it("does not restore a set after the data generation changed", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet(repsSet(exercise.id, 20));
    const undo = (await deleteSet(set.id))!;

    await db.transaction("rw", db.meta, bumpDataGeneration);

    expect(await restoreSet(undo)).toBe(false);
  });

  it("does not restore a set when a full restore commits during the undo", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet(repsSet(exercise.id, 20));
    const undo = (await deleteSet(set.id))!;

    const replace = db.transaction("rw", db.exercises, db.sets, db.meta, async () => {
      await db.sets.clear();
      await db.exercises.clear();
      await db.exercises.add(exercise);
      await bumpDataGeneration();
    });
    const restored = restoreSet(undo);
    await replace;

    expect(await restored).toBe(false);
    expect(await db.sets.count()).toBe(0);
  });

  it("rejects reps and seconds beyond the safe integer range", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    const plank = await createExercise({ name: "Plank", metric: "time" });

    await expect(addSet(repsSet(pushUps.id, 1e16))).rejects.toMatchObject({
      code: "invalid_input",
    });
    await expect(
      addSet({ exerciseId: plank.id, date: "2026-10-19", reps: null, weightKg: null, seconds: 1e16 }),
    ).rejects.toMatchObject({ code: "invalid_input" });
  });

  it("keeps loads to 0.01 kg and validates them after rounding", async () => {
    const squat = await createExercise({ name: "Squat", metric: "reps_weight" });
    const loaded = (weightKg: number) => ({
      exerciseId: squat.id,
      date: "2026-10-19",
      reps: 10,
      weightKg,
      seconds: null,
    });

    await expect(addSet(loaded(24.004))).resolves.toMatchObject({ weightKg: 24 });
    await expect(addSet(loaded(22.505))).resolves.toMatchObject({ weightKg: 22.51 });
    await expect(addSet(loaded(0.004))).rejects.toMatchObject({ code: "invalid_input" });
    await expect(
      updateExercise(squat.id, { progressWeightKg: 24.004 }),
    ).resolves.toMatchObject({ progressWeightKg: 24 });
  });

  it("rejects editing a set of an archived exercise", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const set = await addSet(repsSet(exercise.id, 20));
    await archiveExercise(exercise.id);

    await expect(
      updateSet(set.id, { date: "2026-10-19", reps: 21, weightKg: null, seconds: null }),
    ).rejects.toMatchObject({ code: "archived" });
  });

  it("rolls back the metric lock when writing the first set fails", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    vi.spyOn(db.sets, "add").mockImplementationOnce(
      () => Promise.reject(new Error("disk full")) as ReturnType<typeof db.sets.add>,
    );

    await expect(addSet(repsSet(exercise.id, 20))).rejects.toThrow("disk full");

    expect((await getExercise(exercise.id))?.metricLockedAt).toBeNull();
    expect(await db.sets.count()).toBe(0);
  });

  it("clears the progress weight for metrics other than reps_weight", async () => {
    const exercise = await createExercise({ name: "Squat", metric: "reps_weight" });
    const withLoad = await updateExercise(exercise.id, { progressWeightKg: 24 });
    const withoutLoad = await updateExercise(exercise.id, { metric: "reps" });

    expect(withLoad.progressWeightKg).toBe(24);
    expect(withoutLoad.progressWeightKg).toBeNull();
  });

  it("undoes an archive only while nothing else changed", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });
    const undo = await archiveExerciseWithUndo(exercise.id);

    expect(undo.record.archivedAt).not.toBeNull();
    expect(await undoArchiveExercise(undo)).toBe(true);
    expect((await getExercise(exercise.id))?.archivedAt).toBeNull();

    const second = await archiveExerciseWithUndo(exercise.id);
    await db.exercises.update(exercise.id, { archivedAt: "2026-10-19T10:00:00.000Z" });
    expect(await undoArchiveExercise(second)).toBe(false);
    expect((await getExercise(exercise.id))?.archivedAt).toBe("2026-10-19T10:00:00.000Z");

    await unarchiveExercise(exercise.id);
    const third = await archiveExerciseWithUndo(exercise.id);
    await db.transaction("rw", db.meta, bumpDataGeneration);
    expect(await undoArchiveExercise(third)).toBe(false);
  });

  it("undoes an added set only while it is unchanged", async () => {
    const exercise = await createExercise({ name: "Push-ups", metric: "reps" });

    const undo = await addSetWithUndo(repsSet(exercise.id, 20));
    expect(await undoAddSet(undo)).toBe(true);
    expect(await db.sets.count()).toBe(0);

    const edited = await addSetWithUndo(repsSet(exercise.id, 20));
    await updateSet(edited.record.id, { date: "2026-10-19", reps: 21, weightKg: null, seconds: null });
    expect(await undoAddSet(edited)).toBe(false);

    const stale = await addSetWithUndo(repsSet(exercise.id, 22));
    await db.transaction("rw", db.meta, bumpDataGeneration);
    expect(await undoAddSet(stale)).toBe(false);
    expect(await db.sets.count()).toBe(2);
  });
});
