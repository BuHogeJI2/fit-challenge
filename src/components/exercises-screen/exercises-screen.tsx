import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "wouter";
import { formatRelativeDate, useToday } from "../../lib/dates";
import { listExercises, listSets, type TExercise, type TSet } from "../../lib/db";
import {
  countActiveDaysThisWeek,
  describeExerciseProgress,
  getDailyProgress,
  getExerciseProgress,
  getLatestSet,
  getProgressLoad,
  getTotalBars,
} from "../../lib/stats";
import { BarSparkline, Sparkline } from "../charts";
import { ExerciseFormSheet } from "../exercise-form-sheet";
import { SetEntrySheet, type TSetSheetState } from "../set-entry-sheet";
import { Button, useToast } from "../ui";
import { useArchiveToggle } from "../exercise-form-sheet/use-archive-toggle";
import { exercisesScreenClasses } from "./exercises-screen.styles";
import type { IExerciseRowProps } from "./exercises-screen.types";

const byRecentActivity = (sets: TSet[]) => (left: TExercise, right: TExercise) => {
  const leftLast = getLatestSet(sets.filter((set) => set.exerciseId === left.id));
  const rightLast = getLatestSet(sets.filter((set) => set.exerciseId === right.id));
  const leftKey = leftLast ? `${leftLast.date}${leftLast.createdAt}` : left.createdAt;
  const rightKey = rightLast ? `${rightLast.date}${rightLast.createdAt}` : right.createdAt;
  return rightKey.localeCompare(leftKey);
};

function ExerciseRow({ exercise, sets, todayKey }: IExerciseRowProps) {
  const exerciseSets = sets.filter((set) => set.exerciseId === exercise.id);
  const loadKg = getProgressLoad(exercise, exerciseSets);
  const daily = getDailyProgress(exercise, exerciseSets, loadKg);
  const totalBars = exercise.progressView === "total" ? getTotalBars(daily, todayKey) : null;
  const lastSet = getLatestSet(exerciseSets);

  return (
    <li className={exercisesScreenClasses.item}>
      <Link href={`/exercises/${exercise.id}`} className={exercisesScreenClasses.row}>
        <span className={exercisesScreenClasses.rowHead}>
          <span className={exercisesScreenClasses.name}>{exercise.name}</span>
          <span className={exercisesScreenClasses.when}>
            {lastSet ? formatRelativeDate(lastSet.date, todayKey) : "no sets"}
          </span>
        </span>
        {totalBars ? (
          <BarSparkline
            bars={totalBars.bars}
            startKey={totalBars.startKey}
            endKey={totalBars.endKey}
            stepDays={totalBars.stepDays}
          />
        ) : daily.length ? (
          <Sparkline
            points={daily}
            startKey={daily[0].date}
            endKey={daily[daily.length - 1].date}
          />
        ) : null}
        <span className={exercisesScreenClasses.sentence}>
          {describeExerciseProgress({
            metric: exercise.metric,
            view: exercise.progressView,
            progress: getExerciseProgress(daily),
            loadKg,
            todayKey,
          })}
        </span>
      </Link>
    </li>
  );
}

export function ExercisesScreen() {
  const todayKey = useToday();
  const exercises = useLiveQuery(listExercises, []);
  const sets = useLiveQuery(listSets, []);
  const toast = useToast();
  const [, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [setSheet, setSetSheet] = useState<TSetSheetState>(null);
  const toggleArchive = useArchiveToggle();

  if (!exercises || !sets) {
    return null;
  }

  const active = exercises.filter((exercise) => !exercise.archivedAt).sort(byRecentActivity(sets));
  const archived = exercises
    .filter((exercise) => exercise.archivedAt)
    .sort((left, right) => left.name.localeCompare(right.name));
  const activeDays = countActiveDaysThisWeek(sets, todayKey);

  return (
    <section className={exercisesScreenClasses.screen}>
      <h1 className={exercisesScreenClasses.title}>Training</h1>
      <p className={exercisesScreenClasses.subline}>
        {active.length
          ? `${activeDays} active day${activeDays === 1 ? "" : "s"} this week`
          : "Add the exercises you train, then log your sets."}
      </p>

      {active.length ? (
        <ul className={exercisesScreenClasses.list} aria-label="Exercises">
          {active.map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} sets={sets} todayKey={todayKey} />
          ))}
        </ul>
      ) : null}

      {archived.length ? (
        <details className={exercisesScreenClasses.archived}>
          <summary className={exercisesScreenClasses.archivedSummary}>
            Archived ({archived.length})
          </summary>
          <ul className={exercisesScreenClasses.archivedList}>
            {archived.map((exercise) => (
              <li key={exercise.id}>
                <Link href={`/exercises/${exercise.id}`} className={exercisesScreenClasses.archivedLink}>
                  {exercise.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className={exercisesScreenClasses.footer}>
        <Button variant="text" onClick={() => setIsCreating(true)}>
          New exercise
        </Button>
      </div>

      {active.length ? (
        <button
          type="button"
          className={exercisesScreenClasses.fab}
          aria-label="Log set"
          onClick={() => setSetSheet({ mode: "new" })}
        >
          <svg viewBox="0 0 22 22" aria-hidden="true" className={exercisesScreenClasses.fabIcon}>
            <path d="M11 4v14M4 11h14" />
          </svg>
        </button>
      ) : null}

      <ExerciseFormSheet
        open={isCreating}
        exercise={null}
        onClose={() => setIsCreating(false)}
        onSaved={(exercise) => {
          setIsCreating(false);
          navigate(`/exercises/${exercise.id}`);
        }}
        onArchiveToggle={toggleArchive}
      />

      <SetEntrySheet
        state={setSheet}
        exercises={exercises}
        sets={sets}
        todayKey={todayKey}
        onClose={() => setSetSheet(null)}
        onSaved={() => {
          setSetSheet(null);
          toast.show({ message: "Set logged." });
        }}
      />
    </section>
  );
}
