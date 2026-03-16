import { useMemo, useState } from "react";
import {
  buildChallengeViewModel,
  celebrateDayCompletion,
  getDateKey,
  useFeaturedChallenge,
  useLocalChallengeProgress,
  type TChallengeDayView,
  type TToggleDayDoneOptions,
} from "../../lib/challenge";
import { ChallengeCalendar } from "../challenge-calendar";
import { ChallengeHero } from "../challenge-hero";
import { ChallengeStatus } from "../challenge-status";
import { DayDetailsSheet } from "../day-details-sheet";
import { ExerciseTrackerSheet } from "../exercise-tracker-sheet";
import { FeaturedDayCard } from "../featured-day-card";
import { ProgressSummary } from "../progress-summary";
import { TopProgressBar } from "../top-progress-bar";
import { UpcomingDays } from "../upcoming-days";
import { challengeAppClasses } from "./challenge-app.styles";

export function ChallengeApp() {
  const { challenge, loading, error } = useFeaturedChallenge();
  const {
    progressMap,
    toggleDayDone,
    addExerciseSet,
    removeExerciseSet,
  } = useLocalChallengeProgress(challenge?.run.slug ?? null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [selectedTrackedDayId, setSelectedTrackedDayId] = useState<number | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const viewModel = useMemo(
    () => buildChallengeViewModel(challenge, progressMap),
    [challenge, progressMap],
  );
  const todayKey = useMemo(() => getDateKey(new Date()), []);

  const selectedDay = useMemo<TChallengeDayView | null>(() => {
    if (!viewModel) return null;
    return (
      viewModel.days.find((day) => day.id === selectedDayId) ??
      viewModel.featuredDay
    );
  }, [selectedDayId, viewModel]);

  const handleOpenDay = (dayId: number) => {
    setSelectedTrackedDayId(null);
    setSelectedExerciseId(null);
    setSelectedDayId(dayId);
  };

  const selectedTrackedExercise = useMemo(() => {
    if (!viewModel || selectedTrackedDayId === null || selectedExerciseId === null) {
      return null;
    }

    return (
      viewModel.days
        .find((day) => day.id === selectedTrackedDayId)
        ?.exercises.find(
        (exercise) => exercise.id === selectedExerciseId,
        ) ?? null
    );
  }, [selectedExerciseId, selectedTrackedDayId, viewModel]);

  const selectedTrackedDay = useMemo<TChallengeDayView | null>(() => {
    if (!viewModel || selectedTrackedDayId === null) {
      return null;
    }

    return viewModel.days.find((day) => day.id === selectedTrackedDayId) ?? null;
  }, [selectedTrackedDayId, viewModel]);

  const handleOpenExerciseTracker = (exerciseId: number) => {
    if (!viewModel?.featuredDay?.isActionable) {
      return;
    }

    setSelectedDayId(null);
    setSelectedTrackedDayId(viewModel.featuredDay.id);
    setSelectedExerciseId(exerciseId);
  };

  const handleOpenPastDayTracker = () => {
    if (!selectedDay) {
      return;
    }

    setSelectedDayId(null);
    setSelectedTrackedDayId(selectedDay.id);
    setSelectedExerciseId(
      selectedDay.exercises.length === 1 ? selectedDay.exercises[0]?.id ?? null : null,
    );
  };

  const handleToggleDayDone = (
    dayNumber: number,
    options: TToggleDayDoneOptions,
  ) => {
    toggleDayDone(dayNumber);

    if (options.willMarkDone) {
      celebrateDayCompletion(options.triggerElement);
    }
  };

  const isPastEditableDay = useMemo(() => {
    if (!selectedDay) {
      return false;
    }

    return (
      selectedDay.date < todayKey &&
      selectedDay.isActionable &&
      (selectedDay.state === "missed" || selectedDay.state === "done_local")
    );
  }, [selectedDay, todayKey]);

  return (
    <div className={challengeAppClasses.container}>
      <div className={challengeAppClasses.content}>
        {loading ? (
          <ChallengeStatus
            tone="loading"
            title="Loading challenge"
            body="Fetching the featured run and preparing today's plan."
          />
        ) : error ? (
          <ChallengeStatus
            tone="error"
            title="Unable to load the challenge"
            body={error}
          />
        ) : !viewModel ? (
          <ChallengeStatus
            tone="empty"
            title="No featured challenge"
            body="Seed a challenge run in Supabase and publish it to surface the mobile experience."
          />
        ) : (
          <>
            <TopProgressBar
              localCompletedDays={viewModel.localCompletedDays}
              totalDays={viewModel.scheduleTotalDays}
              scheduleCompletedDays={viewModel.scheduleCompletedDays}
            />

            <ChallengeHero
              title={viewModel.title}
              description={viewModel.description}
              rangeLabel={viewModel.rangeLabel}
              statusLabel={viewModel.statusLabel}
              coverNote={viewModel.coverNote}
              localCompletedDays={viewModel.localCompletedDays}
              totalDays={viewModel.scheduleTotalDays}
            />

            {viewModel.featuredDay ? (
              <FeaturedDayCard
                day={viewModel.featuredDay}
                runPhase={viewModel.runPhase}
                onOpenDay={handleOpenDay}
                onOpenExerciseTracker={handleOpenExerciseTracker}
                onToggleDayDone={handleToggleDayDone}
              />
            ) : null}

            <UpcomingDays days={viewModel.nextDays} onOpenDay={handleOpenDay} />

            <ProgressSummary
              scheduleCompletedDays={viewModel.scheduleCompletedDays}
              scheduleTotalDays={viewModel.scheduleTotalDays}
              localCompletedDays={viewModel.localCompletedDays}
              remainingDays={viewModel.remainingDays}
              phaseLabel={viewModel.progressLabel}
            />

            <ChallengeCalendar
              months={viewModel.calendarMonths}
              onOpenDay={handleOpenDay}
            />

            <DayDetailsSheet
              open={selectedDayId !== null}
              day={selectedDay}
              showPastActions={isPastEditableDay}
              completionActionLabel={
                selectedDay?.state === "done_local"
                  ? "Undo completion"
                  : "Mark done"
              }
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedDayId(null);
                }
              }}
              onTrackSets={handleOpenPastDayTracker}
              onToggleComplete={() => {
                if (!selectedDay) {
                  return;
                }

                handleToggleDayDone(selectedDay.dayNumber, {
                  willMarkDone: selectedDay.state !== "done_local",
                  triggerElement: null,
                });
              }}
            />

            <ExerciseTrackerSheet
              open={selectedTrackedDay !== null}
              day={selectedTrackedDay}
              exercise={selectedTrackedExercise}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedTrackedDayId(null);
                  setSelectedExerciseId(null);
                }
              }}
              onSelectExercise={setSelectedExerciseId}
              onAddExerciseSet={addExerciseSet}
              onRemoveExerciseSet={removeExerciseSet}
            />
          </>
        )}

        <footer className={challengeAppClasses.footer}>
          <p className={challengeAppClasses.footerMeta}>
            Built by <span className={challengeAppClasses.footerAuthor}>BuHogeJI</span>
          </p>
          <a
            className={challengeAppClasses.footerLink}
            href="https://github.com/BuHogeJI2/fit-challenge"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
