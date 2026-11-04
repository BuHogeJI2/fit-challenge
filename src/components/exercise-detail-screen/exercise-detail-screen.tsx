import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "wouter";
import { formatDateInContext, formatDayHeading, getWeekStart, useToday } from "../../lib/dates";
import {
  addSetWithUndo,
  deleteSet,
  getExercise,
  isRepositoryError,
  listExercises,
  listSets,
  restoreSet,
  updateExercise,
  type TExercise,
  type TMetric,
  type TPendingUndo,
  type TProgressView,
  type TSet,
  type TSetValues,
  undoAddSet,
} from "../../lib/db";
import { formatDuration, formatLoadValue, formatReps } from "../../lib/numbers";
import {
  describeExerciseProgress,
  describeSessionProgress,
  formatProgressValue,
  formatSetValues,
  getDailyBest,
  getDailyProgress,
  getEntryNoun,
  getExerciseProgress,
  getLatestSet,
  getLoads,
  getProgressBars,
  getProgressLoad,
  groupSetsByDay,
} from "../../lib/stats";
import { BarChart, LineChart } from "../charts";
import { getRangeAxisLabels } from "../charts/axis-labels";
import { ExerciseFormSheet } from "../exercise-form-sheet";
import { useArchiveToggle } from "../exercise-form-sheet/use-archive-toggle";
import { SetEntrySheet, type TSetSheetState } from "../set-entry-sheet";
import { Button, useToast } from "../ui";
import { exerciseDetailScreenClasses as classes } from "./exercise-detail-screen.styles";
import type { IExerciseDetailScreenProps, ISetChipProps } from "./exercise-detail-screen.types";

const CHART_MIN_SPAN = { reps: 4, reps_weight: 4, time: 30, session: 4 } as const;

const VALUE_UNITS: Record<TMetric, string> = {
  reps: "reps",
  reps_weight: "reps",
  time: "m:ss",
  session: "sessions",
};

const SESSION_VALUES: TSetValues = { reps: null, weightKg: null, seconds: null };

const PROGRESS_VIEW_OPTIONS: { view: TProgressView; label: string }[] = [
  { view: "total", label: "Day total" },
  { view: "best", label: "Best set" },
];

const countOf = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;

const formatChip = (exercise: TExercise, set: TSet) => {
  switch (exercise.metric) {
    case "reps":
      return String(set.reps);
    case "reps_weight":
      return `${set.reps} × ${formatLoadValue(set.weightKg ?? 0)}`;
    case "time":
      return formatDuration(set.seconds ?? 0);
    case "session":
      return "Session";
  }
};

const describeEntry = (exercise: TExercise, set: TSet) =>
  exercise.metric === "session" ? "session" : `set: ${formatSetValues(exercise.metric, set)}`;

function SetChip({ exercise, set, isBest, onEdit }: ISetChipProps) {
  return (
    <button
      type="button"
      className={isBest ? classes.chipBest : classes.chip}
      aria-label={`Edit ${describeEntry(exercise, set)}`}
      onClick={() => onEdit(set)}
    >
      {formatChip(exercise, set)}
    </button>
  );
}

export function ExerciseDetailScreen({ exerciseId }: IExerciseDetailScreenProps) {
  const todayKey = useToday();
  const exercise = useLiveQuery(async () => (await getExercise(exerciseId)) ?? null, [exerciseId]);
  const exercises = useLiveQuery(listExercises, []);
  const allSets = useLiveQuery(listSets, []);
  const toast = useToast();
  const toggleArchive = useArchiveToggle();
  const [isEditing, setIsEditing] = useState(false);
  const [setSheet, setSetSheet] = useState<TSetSheetState>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (exercise === undefined || !exercises || !allSets) {
    return null;
  }

  if (exercise === null) {
    return (
      <section className={classes.screen}>
        <h1 className={classes.title}>Not found</h1>
        <p className={classes.subline}>This exercise does not exist on this device.</p>
        <Link href="/exercises" className={classes.backLink}>
          Back to training
        </Link>
      </section>
    );
  }

  const sets = allSets.filter((set) => set.exerciseId === exercise.id);
  const loads = getLoads(sets);
  const loadKg = getProgressLoad(exercise, sets);
  const dailyBest = getDailyBest(exercise.metric, sets, loadKg);
  const daily = getDailyProgress(exercise, sets, loadKg);
  const progress = getExerciseProgress(daily);
  const days = groupSetsByDay(sets);
  const lastSet = getLatestSet(sets);
  const isArchived = Boolean(exercise.archivedAt);
  const isSession = exercise.metric === "session";
  const noun = getEntryNoun(exercise.metric);
  const totalBars = getProgressBars(exercise, daily, todayKey);
  const chartPoints = totalBars?.bars ?? daily;
  const isWeekly = totalBars?.stepDays === 7;
  const selectedKey = selectedDate !== null && isWeekly ? getWeekStart(selectedDate) : selectedDate;
  const selected =
    chartPoints.find((point) => point.date === selectedKey) ?? chartPoints.at(-1) ?? null;
  const chartPeriod = isWeekly ? "week" : "day";
  const chartValue = isSession ? "sessions" : totalBars ? "total" : "best";
  const chartLabel = `${exercise.name}, ${chartValue} of each ${chartPeriod}, ${countOf(chartPoints.length, chartPeriod)}`;

  const handleDeleteSet = async (set: TSet) => {
    const undo = await deleteSet(set.id);
    setSetSheet(null);
    if (!undo) return;

    toast.show({
      message: `Deleted ${describeEntry(exercise, set)}`,
      action: { label: "Undo", onAction: () => handleUndoDelete(undo) },
    });
  };

  const handleUndoDelete = async (undo: TPendingUndo<TSet>) => {
    try {
      if (!(await restoreSet(undo))) {
        toast.show({ message: "Undo is no longer available." });
      }
    } catch {
      toast.show({ message: "Could not undo. Nothing was changed." });
    }
  };

  const handleRepeat = async (values: TSetValues, date: string) => {
    try {
      const undo = await addSetWithUndo({
        exerciseId: exercise.id,
        date,
        reps: values.reps,
        weightKg: values.weightKg,
        seconds: values.seconds,
      });
      const dateContext = date === todayKey ? "" : ` · ${formatDateInContext(date, todayKey)}`;
      toast.show({
        message: `Logged ${formatSetValues(exercise.metric, undo.record)}${dateContext}`,
        action: {
          label: "Undo",
          onAction: async () => {
            try {
              if (!(await undoAddSet(undo))) {
                toast.show({ message: "Undo is no longer available." });
              }
            } catch {
              toast.show({ message: "Could not undo. Nothing was changed." });
            }
          },
        },
      });
    } catch (error) {
      toast.show({
        message: isRepositoryError(error) ? error.message : `Could not log the ${noun}. Nothing was changed.`,
      });
    }
  };

  const handleRestore = async () => {
    try {
      await toggleArchive(exercise);
    } catch {
      toast.show({ message: "Could not restore. Nothing was changed." });
    }
  };

  const handleSelectLoad = async (value: number) => {
    try {
      await updateExercise(exercise.id, { progressWeightKg: value });
      setSelectedDate(null);
    } catch {
      toast.show({ message: "Could not change the weight. Nothing was changed." });
    }
  };

  const handleSelectView = async (progressView: TProgressView) => {
    try {
      await updateExercise(exercise.id, { progressView });
    } catch {
      toast.show({ message: "Could not change the chart. Nothing was changed." });
    }
  };

  const valueUnit = VALUE_UNITS[exercise.metric];
  const formatAxisValue = (value: number) =>
    exercise.metric === "time" ? formatDuration(Math.round(value)) : String(Math.round(value));

  return (
    <section className={classes.screen}>
      <div className={classes.topRow}>
        <Link href="/exercises" className={classes.backLink}>
          <svg viewBox="0 0 18 18" aria-hidden="true" className={classes.backIcon}>
            <path d="M11 3.5 5.5 9l5.5 5.5" />
          </svg>
          Training
        </Link>
        <Button variant="quiet" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>

      <h1 className={classes.title}>{exercise.name}</h1>
      <p className={classes.sentence}>
        {isSession
          ? describeSessionProgress(daily, todayKey)
          : describeExerciseProgress({
              metric: exercise.metric,
              view: exercise.progressView,
              progress,
              loadKg,
              todayKey,
            })}
      </p>

      {isArchived ? (
        <div className={classes.notice}>
          <p className={classes.noticeText}>Archived. Its history is kept; restore it to log new {noun}s.</p>
          <Button variant="outline" size="sm" onClick={() => void handleRestore()}>
            Restore
          </Button>
        </div>
      ) : null}

      {daily.length && !isSession ? (
        <div className={classes.views} role="group" aria-label="Chart value">
          {PROGRESS_VIEW_OPTIONS.map(({ view, label }) => (
            <button
              key={view}
              type="button"
              aria-pressed={view === exercise.progressView}
              className={view === exercise.progressView ? classes.optionActive : classes.option}
              onClick={() => void handleSelectView(view)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {exercise.metric === "reps_weight" && loads.length > 1 ? (
        <div className={classes.loads} role="group" aria-label="Chart weight">
          {loads.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={value === loadKg}
              className={value === loadKg ? classes.optionActive : classes.option}
              onClick={() => void handleSelectLoad(value)}
            >
              {formatLoadValue(value)} kg
            </button>
          ))}
        </div>
      ) : null}

      {daily.length ? (
        <div className={classes.chart}>
          <p className={classes.readout} aria-live="polite">
            {selected
              ? `${isWeekly ? "Week of " : ""}${formatDateInContext(selected.date, todayKey)} · ${formatProgressValue(exercise.metric, selected.value)}${
                  exercise.metric === "reps_weight" && loadKg !== null
                    ? ` at ${formatLoadValue(loadKg)} kg`
                    : ""
                }`
              : null}
          </p>
          {totalBars ? (
            <BarChart
              bars={totalBars.bars}
              startKey={totalBars.startKey}
              endKey={totalBars.endKey}
              stepDays={totalBars.stepDays}
              xLabels={getRangeAxisLabels(totalBars.startKey, totalBars.endKey)}
              selectedDate={selected?.date ?? null}
              onSelect={setSelectedDate}
              formatValue={formatAxisValue}
              unit={valueUnit}
              minSpan={CHART_MIN_SPAN[exercise.metric]}
              label={chartLabel}
            />
          ) : (
            <LineChart
              points={daily}
              startKey={daily[0].date}
              endKey={daily[daily.length - 1].date}
              xLabels={getRangeAxisLabels(daily[0].date, daily[daily.length - 1].date)}
              selectedDate={selected?.date ?? null}
              onSelect={setSelectedDate}
              formatValue={formatAxisValue}
              unit={valueUnit}
              minSpan={CHART_MIN_SPAN[exercise.metric]}
              label={chartLabel}
            />
          )}
        </div>
      ) : (
        <p className={classes.empty}>No {noun}s yet. Log the first one below.</p>
      )}

      {days.length ? (
        <ol className={classes.days} aria-label="History">
          {days.map((day) => {
            const bestValue = dailyBest.find((item) => item.date === day.date)?.value ?? null;
            const dayLastSet = day.sets.at(-1);
            return (
              <li key={day.date} className={classes.day}>
                <div className={classes.dayHead}>
                  <h2 className={classes.dayTitle}>{formatDayHeading(day.date, todayKey)}</h2>
                  <span className={classes.daySummary}>
                    {isSession
                      ? countOf(day.sets.length, "session")
                      : `${countOf(day.sets.length, "set")} / ${
                          exercise.metric === "time"
                            ? formatDuration(day.totalSeconds ?? 0)
                            : formatReps(day.totalReps ?? 0)
                        }`}
                  </span>
                </div>
                <div className={classes.chips}>
                  {day.sets.map((set) => (
                    <SetChip
                      key={set.id}
                      exercise={exercise}
                      set={set}
                      isBest={
                        !isSession &&
                        bestValue !== null &&
                        (exercise.metric !== "reps_weight" || set.weightKg === loadKg) &&
                        (exercise.metric === "time" ? set.seconds : set.reps) === bestValue
                      }
                      onEdit={(item) => setSetSheet({ mode: "edit", set: item })}
                    />
                  ))}
                  {dayLastSet && !isArchived ? (
                    <button
                      type="button"
                      className={classes.repeatChip}
                      aria-label={`Repeat ${formatSetValues(exercise.metric, dayLastSet)} for ${formatDayHeading(day.date, todayKey)}`}
                      onClick={() => void handleRepeat(dayLastSet, day.date)}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" className={classes.repeatIcon}>
                        <path d="M8 3v10M3 8h10" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      {!isArchived ? (
        <div className={classes.actions}>
          {isSession ? (
            <Button variant="outline" onClick={() => void handleRepeat(SESSION_VALUES, todayKey)}>
              Log today
            </Button>
          ) : lastSet ? (
            <Button variant="outline" onClick={() => void handleRepeat(lastSet, todayKey)}>
              Repeat {formatChip(exercise, lastSet)}
            </Button>
          ) : null}
          <Button onClick={() => setSetSheet({ mode: "new", exerciseId: exercise.id })}>
            Log {noun}
          </Button>
        </div>
      ) : null}

      <ExerciseFormSheet
        open={isEditing}
        exercise={exercise}
        onClose={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
        onArchiveToggle={async (item) => {
          await toggleArchive(item);
          setIsEditing(false);
        }}
      />

      <SetEntrySheet
        state={setSheet}
        exercises={exercises}
        sets={allSets}
        todayKey={todayKey}
        onClose={() => setSetSheet(null)}
        onSaved={(saved) => {
          setSetSheet(null);
          setSelectedDate(saved.date);
        }}
        onDelete={handleDeleteSet}
      />
    </section>
  );
}
