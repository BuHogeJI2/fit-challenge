import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addSet,
  addSetWithUndo,
  archiveExercise,
  bumpDataGeneration,
  createExercise,
  createTraining,
  db,
  deleteSet,
  deleteTraining,
  getTraining,
  listSetsForTraining,
  listTrainingsOnDate,
  resolveTrainingTarget,
  restoreSet,
  restoreTraining,
  TRAINING_NAME_MAX_LENGTH,
  undoAddSet,
  updateSet,
  updateTraining,
  type TTraining,
} from "../lib/db";
import { resetDatabase } from "./db-test-utils";

const DAY = "2026-10-19";
const NEXT_DAY = "2026-10-20";

const repsSet = (exerciseId: string, reps: number, date = DAY) => ({
  exerciseId,
  date,
  reps,
  weightKg: null,
  seconds: null,
});

const training = (id: string, date = DAY): TTraining => ({
  id,
  date,
  name: null,
  note: null,
  createdAt: "2026-10-19T08:00:00.000Z",
  updatedAt: "2026-10-19T08:00:00.000Z",
});

const tables = async () => ({
  exercises: await db.exercises.toArray(),
  trainings: await db.trainings.toArray(),
  sets: await db.sets.toArray(),
});

describe("training repository", () => {
  let pushUps: string;
  let boxing: string;

  beforeEach(async () => {
    await resetDatabase();
    pushUps = (await createExercise({ name: "Push-ups", metric: "reps" })).id;
    boxing = (await createExercise({ name: "Boxing", metric: "session" })).id;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("choosing the training for an entry", () => {
    it("resolves a missing target from the trainings on the date", () => {
      expect(resolveTrainingTarget([])).toEqual({ newTraining: true });
      expect(resolveTrainingTarget([training("only")])).toEqual({ trainingId: "only" });
      expect(() => resolveTrainingTarget([training("a"), training("b")]))
        .toThrow(expect.objectContaining({ code: "training_choice_required" }));
      expect(resolveTrainingTarget([training("a"), training("b")], { trainingId: "b" }))
        .toEqual({ trainingId: "b" });
      expect(resolveTrainingTarget([training("a")], { newTraining: true })).toEqual({ newTraining: true });
    });

    it("creates a training with the first entry of a date and reuses it after", async () => {
      const first = await addSet(repsSet(pushUps, 10));
      const second = await addSet({ ...repsSet(boxing, 0), reps: null });

      const trainings = await db.trainings.toArray();
      expect(trainings).toHaveLength(1);
      expect(trainings[0]).toMatchObject({ date: DAY, name: null, note: null, createdAt: first.createdAt });
      expect([first.trainingId, second.trainingId]).toEqual([trainings[0].id, trainings[0].id]);
    });

    it("asks for a choice when the date has several trainings and writes nothing", async () => {
      await addSet(repsSet(pushUps, 10));
      await addSet({ ...repsSet(pushUps, 12), target: { newTraining: true } });
      const before = await tables();

      await expect(addSet(repsSet(pushUps, 14))).rejects.toMatchObject({ code: "training_choice_required" });
      expect(await tables()).toEqual(before);
    });

    it("adds to an explicit training and refuses one that is missing or on another date", async () => {
      const morning = await addSet(repsSet(pushUps, 10));
      const evening = await addSet({ ...repsSet(pushUps, 12), target: { newTraining: true } });
      expect(evening.trainingId).not.toBe(morning.trainingId);

      const chosen = await addSet({ ...repsSet(pushUps, 14), target: { trainingId: morning.trainingId } });
      expect(chosen.trainingId).toBe(morning.trainingId);

      const before = await tables();
      await expect(addSet({ ...repsSet(pushUps, 1), target: { trainingId: "missing" } }))
        .rejects.toMatchObject({ code: "not_found" });
      await expect(addSet({ ...repsSet(pushUps, 1, NEXT_DAY), target: { trainingId: morning.trainingId } }))
        .rejects.toMatchObject({ code: "invalid_input" });
      expect(await tables()).toEqual(before);
    });

    it("does not create a training when the entry itself is refused", async () => {
      await expect(addSet({ ...repsSet(pushUps, 0) })).rejects.toMatchObject({ code: "invalid_input" });
      await archiveExercise(boxing);
      await expect(addSet({ ...repsSet(boxing, 0), reps: null })).rejects.toMatchObject({ code: "archived" });
      expect(await db.trainings.count()).toBe(0);
    });

    it("lists the trainings on a date oldest first", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      try {
        vi.setSystemTime(new Date("2026-10-19T18:00:00.000Z"));
        const evening = await createTraining({ date: DAY, name: "Evening" });
        vi.setSystemTime(new Date("2026-10-19T07:00:00.000Z"));
        const morning = await createTraining({ date: DAY });
        await createTraining({ date: NEXT_DAY });

        expect((await listTrainingsOnDate(DAY)).map((item) => item.id)).toEqual([morning.id, evening.id]);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("undoing an added entry", () => {
    it("removes the training the add created", async () => {
      const undo = await addSetWithUndo(repsSet(pushUps, 10));
      expect(undo.training).toMatchObject({ id: undo.record.trainingId });

      expect(await undoAddSet(undo)).toBe(true);
      expect(await tables()).toMatchObject({ trainings: [], sets: [] });
    });

    it("keeps an existing training and a created one that changed or gained entries", async () => {
      const existing = await addSetWithUndo(repsSet(pushUps, 10));
      const second = await addSetWithUndo(repsSet(pushUps, 12));
      expect(second.training).toBeNull();
      expect(await undoAddSet(second)).toBe(true);
      expect(await db.trainings.count()).toBe(1);

      await addSet(repsSet(pushUps, 14));
      expect(await undoAddSet(existing)).toBe(true);
      expect(await db.trainings.count()).toBe(1);

      const named = await addSetWithUndo(repsSet(pushUps, 10, NEXT_DAY));
      await updateTraining(named.record.trainingId, { date: NEXT_DAY, name: "Home", note: null });
      expect(await undoAddSet(named)).toBe(true);
      expect(await getTraining(named.record.trainingId)).toMatchObject({ name: "Home" });
    });

    it("refuses when the entry moved to another training", async () => {
      const undo = await addSetWithUndo(repsSet(pushUps, 10));
      const moved = await updateSet(undo.record.id, {
        ...repsSet(pushUps, 10), target: { newTraining: true },
      });

      expect(await undoAddSet(undo)).toBe(false);
      expect(await db.sets.get(undo.record.id)).toEqual(moved);
    });
  });

  describe("editing and moving entries", () => {
    it("keeps the training when the date stays and moves with a new date", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      const edited = await updateSet(set.id, { ...repsSet(pushUps, 11) });
      expect(edited.trainingId).toBe(set.trainingId);

      const moved = await updateSet(set.id, { ...repsSet(pushUps, 11, NEXT_DAY) });
      const target = await getTraining(moved.trainingId);
      expect(target).toMatchObject({ date: NEXT_DAY });
      expect(await getTraining(set.trainingId)).toBeUndefined();
    });

    it("keeps a named or noted training that a move leaves empty", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      await updateTraining(set.trainingId, { date: DAY, name: null, note: "Felt good" });

      const moved = await updateSet(set.id, { ...repsSet(pushUps, 10), target: { newTraining: true } });
      expect(moved.trainingId).not.toBe(set.trainingId);
      expect(await getTraining(set.trainingId)).toMatchObject({ note: "Felt good" });
      expect(await listSetsForTraining(set.trainingId)).toEqual([]);
    });

    it("refuses an ambiguous or mismatched move and changes nothing", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      await createTraining({ date: NEXT_DAY });
      await createTraining({ date: NEXT_DAY });
      const before = await tables();

      await expect(updateSet(set.id, { ...repsSet(pushUps, 10, NEXT_DAY) }))
        .rejects.toMatchObject({ code: "training_choice_required" });
      await expect(updateSet(set.id, { ...repsSet(pushUps, 10, NEXT_DAY), target: { trainingId: set.trainingId } }))
        .rejects.toMatchObject({ code: "invalid_input" });
      expect(await tables()).toEqual(before);
    });
  });

  describe("deleting and restoring entries", () => {
    it("removes an unnamed training with its last entry and Undo restores both", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      const parent = await getTraining(set.trainingId);
      const before = await tables();

      const undo = await deleteSet(set.id);
      expect(undo).toMatchObject({ record: set, training: parent });
      expect(await db.trainings.count()).toBe(0);

      expect(await restoreSet(undo!)).toBe(true);
      expect(await tables()).toEqual(before);
    });

    it("keeps the training while other entries or a name remain", async () => {
      const first = await addSet(repsSet(pushUps, 10));
      const second = await addSet(repsSet(pushUps, 12));
      expect((await deleteSet(first.id))?.training).toBeNull();
      await updateTraining(second.trainingId, { date: DAY, name: "Garage", note: null });
      expect((await deleteSet(second.id))?.training).toBeNull();
      expect(await getTraining(second.trainingId)).toMatchObject({ name: "Garage" });
    });

    it("never recreates a training that a later action deleted", async () => {
      const first = await addSet(repsSet(pushUps, 10));
      await addSet(repsSet(pushUps, 12));
      const undo = await deleteSet(first.id);
      expect(undo?.training).toBeNull();

      await deleteTraining(first.trainingId);
      expect(await restoreSet(undo!)).toBe(false);
      expect(await tables()).toMatchObject({ trainings: [], sets: [] });
    });

    it("refuses to restore the removed training when its id was taken", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      const undo = await deleteSet(set.id);
      await db.trainings.add({ ...undo!.training!, name: "Taken" });

      expect(await restoreSet(undo!)).toBe(false);
      expect(await db.sets.count()).toBe(0);
    });

    it("restores entries of archived exercises", async () => {
      const set = await addSet({ ...repsSet(boxing, 0), reps: null });
      const undo = await deleteSet(set.id);
      await archiveExercise(boxing);

      expect(await restoreSet(undo!)).toBe(true);
      expect(await db.sets.get(set.id)).toEqual(set);
      expect(await getTraining(set.trainingId)).toBeDefined();
    });

    it("rolls back a failed restore of a set and its training", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      const undo = await deleteSet(set.id);
      vi.spyOn(db.sets, "add").mockRejectedValueOnce(new Error("Injected failure"));

      await expect(restoreSet(undo!)).rejects.toThrow("Injected failure");
      expect(await tables()).toMatchObject({ trainings: [], sets: [] });
    });
  });

  describe("training records", () => {
    it("normalizes names and notes and limits the name length", async () => {
      const created = await createTraining({ date: DAY, name: "  Boxing   club ", note: "  " });
      expect(created).toMatchObject({ name: "Boxing club", note: null });

      await expect(createTraining({ date: DAY, name: "x".repeat(TRAINING_NAME_MAX_LENGTH + 1) }))
        .rejects.toMatchObject({ code: "invalid_input" });
      await expect(createTraining({ date: "2026-02-30" })).rejects.toMatchObject({ code: "invalid_input" });
      await expect(updateTraining("missing", { date: DAY, name: null, note: null }))
        .rejects.toMatchObject({ code: "not_found" });
    });

    it("moves every entry with the training's date in one write", async () => {
      const first = await addSet(repsSet(pushUps, 10));
      const second = await addSet({ ...repsSet(boxing, 0), reps: null });
      const other = await addSet({ ...repsSet(pushUps, 5), target: { newTraining: true } });

      const moved = await updateTraining(first.trainingId, { date: NEXT_DAY, name: "Moved", note: null });
      expect(moved).toMatchObject({ date: NEXT_DAY, name: "Moved" });
      const sets = await listSetsForTraining(first.trainingId);
      expect(sets.map((set) => [set.id, set.date]).sort()).toEqual(
        [[first.id, NEXT_DAY], [second.id, NEXT_DAY]].sort(),
      );
      expect(sets.every((set) => set.updatedAt === moved.updatedAt)).toBe(true);
      expect(await db.sets.get(other.id)).toEqual(other);
    });

    it("refuses to move a training with archived entries but still renames it", async () => {
      const set = await addSet({ ...repsSet(boxing, 0), reps: null });
      await archiveExercise(boxing);
      const before = await tables();

      await expect(updateTraining(set.trainingId, { date: NEXT_DAY, name: null, note: null }))
        .rejects.toMatchObject({ code: "archived" });
      expect(await tables()).toEqual(before);
      await expect(updateTraining(set.trainingId, { date: DAY, name: "Sparring", note: "Hard" }))
        .resolves.toMatchObject({ name: "Sparring", note: "Hard" });
    });

    it("rolls back a failed move", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      const before = await tables();
      vi.spyOn(db.trainings, "put").mockRejectedValueOnce(new Error("Injected failure"));

      await expect(updateTraining(set.trainingId, { date: NEXT_DAY, name: null, note: null }))
        .rejects.toThrow("Injected failure");
      expect(await tables()).toEqual(before);
    });

    it("deletes a training with all entries and restores them together", async () => {
      const first = await addSet(repsSet(pushUps, 10));
      await addSet({ ...repsSet(boxing, 0), reps: null });
      const other = await addSet({ ...repsSet(pushUps, 5), target: { newTraining: true } });
      const before = await tables();

      const undo = await deleteTraining(first.trainingId);
      expect(undo?.sets).toHaveLength(2);
      expect(await tables()).toMatchObject({ sets: [other] });
      expect(await deleteTraining("missing")).toBeNull();

      expect(await restoreTraining(undo!)).toBe(true);
      const after = await tables();
      expect(after.trainings).toEqual(expect.arrayContaining(before.trainings));
      expect(after.sets).toEqual(expect.arrayContaining(before.sets));
      expect(after.sets).toHaveLength(before.sets.length);
    });

    it("refuses a stale training restore and changes nothing", async () => {
      const set = await addSet(repsSet(pushUps, 10));
      const takenSet = await deleteTraining(set.trainingId);
      await db.sets.add(set);
      expect(await restoreTraining(takenSet!)).toBe(false);
      await db.sets.clear();

      const afterRestore = await deleteTraining((await addSet(repsSet(pushUps, 11))).trainingId);
      await bumpDataGeneration();
      expect(await restoreTraining(afterRestore!)).toBe(false);

      const metricChanged = await deleteTraining((await addSet(repsSet(pushUps, 12))).trainingId);
      await db.exercises.delete(pushUps);
      expect(await restoreTraining(metricChanged!)).toBe(false);
      expect(await tables()).toMatchObject({ trainings: [], sets: [] });
    });

    it("restores a deleted training with archived entries", async () => {
      const set = await addSet({ ...repsSet(boxing, 0), reps: null });
      const undo = await deleteTraining(set.trainingId);
      await archiveExercise(boxing);

      expect(await restoreTraining(undo!)).toBe(true);
      expect(await db.sets.get(set.id)).toEqual(set);
    });
  });
});
