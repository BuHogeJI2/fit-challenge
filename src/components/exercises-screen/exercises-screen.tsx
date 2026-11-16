import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "wouter";
import { addDays, formatDateRange, formatDayHeading, formatRelativeDate, getWeekStart, parseDateKey, useToday } from "../../lib/dates";
import { appHref, useAppSearch, getAppPath, rememberView, useRestoreView } from "../../lib/navigation";
import { listExercises, listSets, listTrainings } from "../../lib/db";
import { formatLoadValue } from "../../lib/numbers";
import { getLatestSet, getTrainingDayCounts, getTrainingExercises, getTrainingTitle } from "../../lib/stats";
import { TrainingDaysChart } from "../charts";
import { PeriodPager } from "../period-pager";
import { ExerciseFormSheet } from "../exercise-form-sheet";
import { SetEntrySheet, type TSetSheetState } from "../set-entry-sheet";
import { Button, SegmentedControl, useToast } from "../ui";
import { useArchiveToggle } from "../exercise-form-sheet/use-archive-toggle";
import { exercisesScreenClasses as classes } from "./exercises-screen.styles";
import type { IExerciseRowProps, TTrainingView } from "./exercises-screen.types";
import { useSavedEntry } from "../../lib/motion";

const VIEWS = [
  { value: "week", label: "Week" },
  { value: "library", label: "Library" },
] as const;

const RECENT_SESSION_DAYS = 28;

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

const describeLastActivity = ({ exercise, sets, todayKey }: Omit<IExerciseRowProps, "returnTo" | "savedEntry">) => {
  const exerciseSets = sets.filter((set) => set.exerciseId === exercise.id);
  const latest = getLatestSet(exerciseSets);
  if (!latest) return exercise.metric === "session" ? "No sessions yet" : "No sets yet";

  const when = formatRelativeDate(latest.date, todayKey);
  const last = when === "today" || when === "yesterday" ? `${when[0].toUpperCase()}${when.slice(1)}` : `Last ${when}`;
  if (exercise.metric === "session") {
    const windowStart = addDays(todayKey, 1 - RECENT_SESSION_DAYS);
    const recent = exerciseSets.filter((set) => set.date >= windowStart && set.date <= todayKey).length;
    return `${last} · ${recent ? plural(recent, "session") : "no sessions"} in 4 weeks`;
  }
  const latestTraining = exerciseSets.filter((set) => set.trainingId === latest.trainingId);
  if (exercise.metric === "reps_weight") {
    const loads = new Set(latestTraining.map((set) => set.weightKg));
    const [load] = loads;
    const weight = loads.size === 1 && load !== null ? `at ${formatLoadValue(load)} kg` : "· mixed weights";
    return `${last} · ${plural(latestTraining.length, "set")} ${weight}`;
  }
  return `${last} · ${getTrainingExercises(latestTraining, [exercise])[0].summary}`;
};

function ExerciseRow({ exercise, sets, todayKey, returnTo, savedEntry }: IExerciseRowProps) {
  return (
    <li data-saved-row={savedEntry?.id === exercise.id ? savedEntry.phase : undefined}>
      <Link href={appHref(`/exercises/${exercise.id}`, { from: returnTo })} onClick={() => rememberView(returnTo)} className={classes.row}>
        <span className={classes.rowText}>
          <span className={classes.name}>{exercise.name}</span>
          <span className={classes.last}>{describeLastActivity({ exercise, sets, todayKey })}</span>
        </span>
        <span className={classes.chevron} aria-hidden="true">›</span>
      </Link>
    </li>
  );
}

export function ExercisesScreen() {
  const todayKey = useToday();
  const exercises = useLiveQuery(listExercises, []);
  const sets = useLiveQuery(listSets, []);
  const trainings = useLiveQuery(listTrainings, []);
  const toast = useToast();
  const [, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [setSheet, setSetSheet] = useState<TSetSheetState>(null);
  const toggleArchive = useArchiveToggle();
  const routeSearch = useAppSearch();
  const params = new URLSearchParams(routeSearch);
  const view: TTrainingView = params.get("view") === "library" ? "library" : "week";
  const rawWeek = params.get("week");
  const weekStart = rawWeek && parseDateKey(rawWeek) && rawWeek <= todayKey ? getWeekStart(rawWeek) : getWeekStart(todayKey);
  const updateParams = (changes: Record<string, string | null>) => navigate(appHref("/exercises", { ...Object.fromEntries(params), ...changes }), { replace: true });
  const setView = (next: TTrainingView) => updateParams({ view: next });
  const setWeekStart = (next: string) => updateParams({ week: next });
  const returnTo = appHref("/exercises", { view, week: weekStart, archived: params.get("archived") });
  const [savedEntry, markSaved] = useSavedEntry();
  useRestoreView(getAppPath(), Boolean(exercises && sets && trainings));

  if (!exercises || !sets || !trainings) {
    return null;
  }

  const active = exercises.filter((exercise) => !exercise.archivedAt).sort((left, right) => left.name.localeCompare(right.name));
  const archived = exercises
    .filter((exercise) => exercise.archivedAt)
    .sort((left, right) => left.name.localeCompare(right.name));
  const weekEnd = addDays(weekStart, 6);
  const weekTrainings = trainings.filter((training) => training.date >= weekStart && training.date <= weekEnd)
    .sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id));
  const currentWeek = getWeekStart(todayKey);
  const firstWeek = trainings.length ? getWeekStart([...trainings].sort((left, right) => left.date.localeCompare(right.date))[0].date) : currentWeek;
  const isEmpty = !exercises.length && !trainings.length;

  return (
    <section className={classes.screen}>
      <SegmentedControl label="Training view" options={VIEWS} value={view} onChange={setView} />

      {view === "week" ? <>
        <PeriodPager periodKey={weekStart} canPrevious={weekStart > firstWeek} canNext={weekStart < currentWeek} onPrevious={() => setWeekStart(addDays(weekStart, -7))} onNext={() => setWeekStart(addDays(weekStart, 7))} renderPage={(offset, controls) => {
          const start = addDays(weekStart, offset * 7);
          const end = addDays(start, 6);
          const days = getTrainingDayCounts(trainings, sets, start);
          const count = days.reduce((total, day) => total + day.count, 0);
          const activeDays = days.filter((day) => day.count > 0).length;
          const pageSets = sets.filter((set) => set.date >= start && set.date <= end);
          const sessions = getTrainingExercises(pageSets, exercises).filter((group) => group.exercise?.metric === "session");
          return <>
            <div className={classes.period}>
              <h1 className={classes.periodTitle}>{formatDateRange(start, end, todayKey)}</h1>
              <div className={classes.arrows}>
                <button type="button" className={classes.arrow} aria-label="Previous training week" disabled={start <= firstWeek} onClick={controls.onPrevious}>‹</button>
                <button type="button" className={classes.arrow} aria-label="Next training week" disabled={start >= currentWeek} onClick={controls.onNext}>›</button>
              </div>
            </div>
            <div className={classes.weekSummary}>
              <div className={classes.summaryText}>
                <p className={classes.summaryLine}><span className={classes.summaryCount}>{plural(count, "training")}</span> · {plural(activeDays, "active day")}</p>
                {sessions.length ? <p className={classes.sessions}>{sessions.map((group) => `${group.exercise!.name} ×${group.sets.length}`).join(" · ")}</p> : null}
              </div>
              {start !== currentWeek ? <Button variant="soft" size="sm" onClick={() => setWeekStart(currentWeek)}>This week</Button> : null}
            </div>
            <div className={classes.chart}>
              <TrainingDaysChart days={days} todayKey={todayKey} />
            </div>
          </>;
        }} />
        {weekTrainings.length ? <ol key={weekStart} className={classes.trainingList} aria-label="Weekly trainings">
          {weekTrainings.map((training, index) => {
            const groups = getTrainingExercises(sets.filter((set) => set.trainingId === training.id), exercises);
            const title = getTrainingTitle(training, sets, exercises);
            const startsDay = weekTrainings[index - 1]?.date !== training.date;
            return <li key={training.id} className={startsDay ? classes.trainingItemFirst : classes.trainingItem} data-saved-row={savedEntry?.id === training.id ? savedEntry.phase : undefined}>
              {startsDay ? <h2 className={classes.day}>{formatDayHeading(training.date, todayKey)}</h2> : null}
              <Link href={appHref(`/trainings/${training.id}`, { from: returnTo })} onClick={() => rememberView(returnTo)} className={groups.length ? classes.trainingLink : classes.trainingLinkEmpty}>
                <span className={classes.trainingName}>{title}</span><span className={classes.chevron} aria-hidden="true">›</span>
              </Link>
              {training.note ? <p className={classes.trainingNote}>{training.note}</p> : null}
              {groups.length ? <ul className={classes.groupSummary}>
                {groups.map((group) => <li key={group.exerciseId} className={classes.summaryRow}>
                  <span>{group.exercise?.name ?? "Unknown exercise"}</span><span className={classes.metric}>{group.summary}</span>
                </li>)}
              </ul> : <p className={classes.noEntries}>No entries yet</p>}
            </li>;
          })}
        </ol> : <p className={classes.empty}>{isEmpty ? "Add your exercises in the Library, then log your sets." : "No training logged in this week."}</p>}
      </> : <>
        <h1 className={classes.visuallyHidden}>Exercise library</h1>
        <div className={classes.libraryHead}>
          <p className={classes.libraryCount}>{plural(active.length, "exercise")}</p>
          <Button variant="soft" size="sm" onClick={() => setIsCreating(true)}>New exercise</Button>
        </div>
        {active.length ? (
          <ul className={classes.list} aria-label="Exercises">
            {active.map((exercise) => (
              <ExerciseRow key={exercise.id} exercise={exercise} sets={sets} todayKey={todayKey} returnTo={returnTo} savedEntry={savedEntry} />
            ))}
          </ul>
        ) : <p className={classes.empty}>{isEmpty ? "Add the exercises you train, then log your sets." : "No active exercises yet."}</p>}

        {archived.length ? (
          <details className={classes.archived} open={params.get("archived") === "1"} onToggle={(event) => {
            if (event.currentTarget.open !== (params.get("archived") === "1")) updateParams({ archived: event.currentTarget.open ? "1" : null });
          }}>
            <summary className={classes.archivedSummary}>
              Archived ({archived.length})
            </summary>
            <ul className={classes.archivedList}>
              {archived.map((exercise) => (
                <li key={exercise.id}>
                  <Link href={appHref(`/exercises/${exercise.id}`, { from: returnTo })} onClick={() => rememberView(returnTo)} className={classes.archivedLink}>
                    {exercise.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </>}

      {active.length ? (
        <button
          type="button"
          className={classes.fab}
          aria-label="Log set"
          onClick={() => setSetSheet({ mode: "new" })}
        >
          <svg viewBox="0 0 22 22" aria-hidden="true" className={classes.fabIcon}>
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
          navigate(appHref(`/exercises/${exercise.id}`, { from: returnTo }));
        }}
        onArchiveToggle={toggleArchive}
      />

      <SetEntrySheet
        state={setSheet}
        exercises={exercises}
        sets={sets}
        todayKey={todayKey}
        onClose={() => setSetSheet(null)}
        onSaved={(saved) => {
          setSetSheet(null);
          markSaved(view === "week" ? saved.trainingId : saved.exerciseId);
          const metric = exercises.find((exercise) => exercise.id === saved.exerciseId)?.metric;
          toast.show({ message: metric === "session" ? "Session logged." : "Set logged." });
        }}
      />
    </section>
  );
}
