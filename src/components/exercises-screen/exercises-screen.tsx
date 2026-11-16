import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "wouter";
import { addDays, formatDateRange, formatDayHeading, formatRelativeDate, getWeekStart, parseDateKey, useToday } from "../../lib/dates";
import { appHref, useAppSearch, getAppPath, rememberView, useRestoreView } from "../../lib/navigation";
import { listExercises, listSets, listTrainings, type TExercise, type TSet } from "../../lib/db";
import {
  describeExerciseProgress,
  describeSessionProgress,
  getDailyProgress,
  getEntryNoun,
  getExerciseProgress,
  getLatestSet,
  getProgressBars,
  getProgressLoad,
  getTrainingExercises,
  getTrainingTitle,
} from "../../lib/stats";
import { BarSparkline, Sparkline } from "../charts";
import { PeriodPager } from "../period-pager";
import { ExerciseFormSheet } from "../exercise-form-sheet";
import { SetEntrySheet, type TSetSheetState } from "../set-entry-sheet";
import { Button, Field, useToast } from "../ui";
import { useArchiveToggle } from "../exercise-form-sheet/use-archive-toggle";
import { exercisesScreenClasses } from "./exercises-screen.styles";
import type { IExerciseRowProps } from "./exercises-screen.types";
import { useSavedEntry, useSelectionIndicator } from "../../lib/motion";

const byRecentActivity = (sets: TSet[]) => (left: TExercise, right: TExercise) => {
  const leftLast = getLatestSet(sets.filter((set) => set.exerciseId === left.id));
  const rightLast = getLatestSet(sets.filter((set) => set.exerciseId === right.id));
  const leftKey = leftLast ? `${leftLast.date}${leftLast.createdAt}` : left.createdAt;
  const rightKey = rightLast ? `${rightLast.date}${rightLast.createdAt}` : right.createdAt;
  return rightKey.localeCompare(leftKey);
};

function ExerciseRow({ exercise, sets, todayKey, returnTo, savedEntry }: IExerciseRowProps) {
  const exerciseSets = sets.filter((set) => set.exerciseId === exercise.id);
  const loadKg = getProgressLoad(exercise, exerciseSets);
  const daily = getDailyProgress(exercise, exerciseSets, loadKg);
  const totalBars = getProgressBars(exercise, daily, todayKey);
  const lastSet = getLatestSet(exerciseSets);

  return (
    <li className={exercisesScreenClasses.item} data-saved-row={savedEntry?.id === exercise.id ? savedEntry.phase : undefined}>
      <Link href={appHref(`/exercises/${exercise.id}`, { from: returnTo })} onClick={() => rememberView(returnTo)} className={exercisesScreenClasses.row}>
        <span className={exercisesScreenClasses.rowHead}>
          <span className={exercisesScreenClasses.name}>{exercise.name}</span>
          <span className={exercisesScreenClasses.when}>
            {lastSet ? formatRelativeDate(lastSet.date, todayKey) : `no ${getEntryNoun(exercise.metric)}s`}
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
          {exercise.metric === "session"
            ? describeSessionProgress(daily, todayKey)
            : describeExerciseProgress({
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
  const trainings = useLiveQuery(listTrainings, []);
  const toast = useToast();
  const [, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [setSheet, setSetSheet] = useState<TSetSheetState>(null);
  const toggleArchive = useArchiveToggle();
  const routeSearch = useAppSearch();
  const params = new URLSearchParams(routeSearch);
  const view = params.get("view") === "library" ? "library" : "week";
  const rawWeek = params.get("week");
  const weekStart = rawWeek && parseDateKey(rawWeek) && rawWeek <= todayKey ? getWeekStart(rawWeek) : getWeekStart(todayKey);
  const search = params.get("q") ?? "";
  const sort = params.get("sort") === "recent" ? "recent" : "name";
  const updateParams = (changes: Record<string, string | null>) => navigate(appHref("/exercises", { ...Object.fromEntries(params), ...changes }), { replace: true });
  const setView = (next: string) => updateParams({ view: next });
  const setWeekStart = (next: string) => updateParams({ week: next });
  const setSearch = (next: string) => updateParams({ q: next });
  const setSort = (next: string) => updateParams({ sort: next });
  const returnTo = appHref("/exercises", { view, week: weekStart, q: search, sort, archived: params.get("archived") });
  const viewRef = useSelectionIndicator<HTMLDivElement>(view, Boolean(exercises && sets && trainings));
  const sortRef = useSelectionIndicator<HTMLDivElement>(sort, view === "library" && Boolean(exercises && sets && trainings));
  const [savedEntry, markSaved] = useSavedEntry();
  useRestoreView(getAppPath(), Boolean(exercises && sets && trainings));

  if (!exercises || !sets || !trainings) {
    return null;
  }

  const matchesSearch = (exercise: TExercise) => exercise.name.toLowerCase().includes(search.trim().toLowerCase());
  const active = exercises.filter((exercise) => !exercise.archivedAt && matchesSearch(exercise))
    .sort(sort === "recent" ? byRecentActivity(sets) : (left, right) => left.name.localeCompare(right.name));
  const archived = exercises
    .filter((exercise) => exercise.archivedAt && matchesSearch(exercise))
    .sort((left, right) => left.name.localeCompare(right.name));
  const weekEnd = addDays(weekStart, 6);
  const weekTrainings = trainings.filter((training) => training.date >= weekStart && training.date <= weekEnd)
    .sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id));
  const currentWeek = getWeekStart(todayKey);
  const firstWeek = trainings.length ? getWeekStart([...trainings].sort((left, right) => left.date.localeCompare(right.date))[0].date) : currentWeek;
  const hasActive = exercises.some((exercise) => !exercise.archivedAt);

  return (
    <section className={exercisesScreenClasses.screen}>
      <h1 className={exercisesScreenClasses.title}>Training</h1>
      <p className={exercisesScreenClasses.subline}>
        {exercises.length || trainings.length
          ? view === "week" ? "Your weekly training journal" : "Your exercises and their progress"
          : "Add the exercises you train, then log your sets."}
      </p>

      <div ref={viewRef} className={exercisesScreenClasses.views} role="group" aria-label="Training view">
        <button type="button" className={view === "week" ? exercisesScreenClasses.viewActive : exercisesScreenClasses.view} aria-pressed={view === "week"} onClick={() => setView("week")}>Week</button>
        <button type="button" className={view === "library" ? exercisesScreenClasses.viewActive : exercisesScreenClasses.view} aria-pressed={view === "library"} onClick={() => setView("library")}>Library</button>
      </div>

      {view === "week" ? <>
        <PeriodPager periodKey={weekStart} canPrevious={weekStart > firstWeek} canNext={weekStart < currentWeek} onPrevious={() => setWeekStart(addDays(weekStart, -7))} onNext={() => setWeekStart(addDays(weekStart, 7))} renderPage={(offset, controls) => {
          const start = addDays(weekStart, offset * 7);
          const end = addDays(start, 6);
          const pageTrainings = trainings.filter((training) => training.date >= start && training.date <= end);
          const pageSets = sets.filter((set) => set.date >= start && set.date <= end);
          const activeDays = new Set(pageSets.map((set) => set.date)).size;
          const sessions = getTrainingExercises(pageSets, exercises).filter((group) => group.exercise?.metric === "session");
          return <>
            <div className={exercisesScreenClasses.period}>
              <button type="button" className={exercisesScreenClasses.arrow} aria-label="Previous training week" disabled={weekStart <= firstWeek} onClick={controls.onPrevious}>‹</button>
              <h2 className={exercisesScreenClasses.periodTitle}>{formatDateRange(start, end, todayKey)}</h2>
              <button type="button" className={exercisesScreenClasses.arrow} aria-label="Next training week" disabled={weekStart >= currentWeek} onClick={controls.onNext}>›</button>
            </div>
            <div className={exercisesScreenClasses.weekSummary}>
              <p className={exercisesScreenClasses.summaryCount}>{pageTrainings.length} training{pageTrainings.length === 1 ? "" : "s"}</p>
              <p className={exercisesScreenClasses.subline}>{activeDays} active day{activeDays === 1 ? "" : "s"} {start === currentWeek ? "this week" : "in this week"}</p>
              {sessions.length ? <p className={exercisesScreenClasses.subline}>{sessions.map((group) => `${group.exercise!.name} ×${group.sets.length}`).join(" · ")}</p> : null}
            </div>
          </>;
        }} />
        {weekStart !== currentWeek ? <Button variant="text" onClick={() => setWeekStart(currentWeek)}>This week</Button> : null}
        {weekTrainings.length ? <ol key={weekStart} className={exercisesScreenClasses.trainingList} aria-label="Weekly trainings">
          {weekTrainings.map((training, index) => {
            const groups = getTrainingExercises(sets.filter((set) => set.trainingId === training.id), exercises);
            const title = getTrainingTitle(training, sets, exercises);
            return <li key={training.id} className={exercisesScreenClasses.trainingItem} data-saved-row={savedEntry?.id === training.id ? savedEntry.phase : undefined}>
              {weekTrainings[index - 1]?.date !== training.date ? <h3 className={exercisesScreenClasses.day}>{formatDayHeading(training.date, todayKey)}</h3> : null}
              <Link href={appHref(`/trainings/${training.id}`, { from: returnTo })} onClick={() => rememberView(returnTo)} className={exercisesScreenClasses.trainingLink}>
                <span className={exercisesScreenClasses.trainingName}>{title}</span><span aria-hidden="true">›</span>
              </Link>
              {training.note ? <p className={exercisesScreenClasses.trainingNote}>{training.note}</p> : null}
              {groups.length ? <ul className={exercisesScreenClasses.groupSummary}>
                {groups.map((group) => <li key={group.exerciseId} className={exercisesScreenClasses.summaryRow}>
                  <span>{group.exercise?.name ?? "Unknown exercise"}</span><span className={exercisesScreenClasses.metric}>{group.summary}</span>
                </li>)}
              </ul> : <p className={exercisesScreenClasses.subline}>No entries yet</p>}
            </li>;
          })}
        </ol> : <p className={exercisesScreenClasses.empty}>No training logged in this week.</p>}
      </> : <>
        <Field label="Search exercises" type="search" value={search} placeholder="Find an exercise" onChange={(event) => setSearch(event.target.value)} />
        <div ref={sortRef} className={exercisesScreenClasses.views} role="group" aria-label="Sort exercises">
          <button type="button" className={sort === "name" ? exercisesScreenClasses.viewActive : exercisesScreenClasses.view} aria-pressed={sort === "name"} onClick={() => setSort("name")}>A–Z</button>
          <button type="button" className={sort === "recent" ? exercisesScreenClasses.viewActive : exercisesScreenClasses.view} aria-pressed={sort === "recent"} onClick={() => setSort("recent")}>Recent</button>
        </div>
      {active.length ? (
        <ul className={exercisesScreenClasses.list} aria-label="Exercises">
          {active.map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} sets={sets} todayKey={todayKey} returnTo={returnTo} savedEntry={savedEntry} />
          ))}
        </ul>
      ) : <p className={exercisesScreenClasses.empty}>{search ? "No matching exercises." : "No active exercises yet."}</p>}

      {archived.length ? (
        <details className={exercisesScreenClasses.archived} open={params.get("archived") === "1"} onToggle={(event) => {
          if (event.currentTarget.open !== (params.get("archived") === "1")) updateParams({ archived: event.currentTarget.open ? "1" : null });
        }}>
          <summary className={exercisesScreenClasses.archivedSummary}>
            Archived ({archived.length})
          </summary>
          <ul className={exercisesScreenClasses.archivedList}>
            {archived.map((exercise) => (
              <li key={exercise.id}>
                <Link href={appHref(`/exercises/${exercise.id}`, { from: returnTo })} onClick={() => rememberView(returnTo)} className={exercisesScreenClasses.archivedLink}>
                  {exercise.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      </>}

      <div className={exercisesScreenClasses.footer}>
        <Button variant="text" onClick={() => setIsCreating(true)}>
          New exercise
        </Button>
      </div>

      {hasActive ? (
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
