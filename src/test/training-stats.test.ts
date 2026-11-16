import { describe, expect, it } from "vitest";
import type { TExercise, TSet, TTraining } from "../lib/db";
import { getTrainingExercises, getTrainingTitle } from "../lib/stats";

const stamp = { createdAt: "2026-10-19T08:00:00.000Z", updatedAt: "2026-10-19T08:00:00.000Z" };
const training: TTraining = { id: "training", date: "2026-10-19", name: null, note: null, ...stamp };
const exercise = (id: string, name: string, metric: TExercise["metric"]): TExercise => ({
  id, name, metric, metricLockedAt: stamp.createdAt, progressWeightKg: null,
  progressView: "total", archivedAt: null, ...stamp,
});
const entry = (id: string, exerciseId: string, values: Partial<TSet> = {}): TSet => ({
  id, exerciseId, trainingId: training.id, date: training.date,
  reps: null, seconds: null, weightKg: null, note: null, ...stamp, ...values,
});

describe("training summaries", () => {
  it("derives a title from attached sessions only, unless a name was chosen", () => {
    const exercises = [exercise("boxing", "Boxing", "session"), exercise("reps", "Push-ups", "reps")];
    const sets = [entry("1", "boxing"), entry("2", "boxing"), entry("3", "reps", { reps: 20 })];
    expect(getTrainingTitle(training, sets, exercises)).toBe("Boxing");
    expect(getTrainingTitle({ ...training, name: "Morning" }, sets, exercises)).toBe("Morning");
    expect(getTrainingTitle({ ...training, id: "other" }, sets, exercises)).toBe("Training");
  });

  it("keeps session, time, reps and different loads separate", () => {
    const exercises = [exercise("boxing", "Boxing", "session"), exercise("hold", "Plank", "time"), exercise("load", "Squat", "reps_weight")];
    const groups = getTrainingExercises([
      entry("1", "boxing"), entry("2", "boxing"),
      entry("3", "hold", { seconds: 45 }), entry("4", "hold", { seconds: 60 }),
      entry("5", "load", { reps: 10, weightKg: 20 }), entry("6", "load", { reps: 8, weightKg: 24 }),
      entry("7", "load", { reps: 10, weightKg: 20 }),
    ], exercises);
    expect(groups.map((group) => [group.exercise?.name, group.summary])).toEqual([
      ["Boxing", "2 sessions"], ["Plank", "2 sets · 1:45"], ["Squat", "20 reps at 20 kg · 8 reps at 24 kg"],
    ]);
  });

  it("keeps an entry whose exercise is missing visible", () => {
    const missing = entry("orphan", "missing", { reps: 12, note: "Kept" });
    expect(getTrainingExercises([missing], [])).toEqual([
      { exerciseId: "missing", exercise: null, sets: [missing], summary: "1 entry" },
    ]);
  });
});
