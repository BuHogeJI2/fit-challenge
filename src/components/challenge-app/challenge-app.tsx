import { useMemo, useState } from "react";
import {
  buildChallengeViewModel,
  useFeaturedChallenge,
  useLocalChallengeProgress,
  type TChallengeDayView,
} from "../../lib/challenge";
import { ChallengeCalendar } from "../challenge-calendar";
import { ChallengeHero } from "../challenge-hero";
import { ChallengeStatus } from "../challenge-status";
import { DayDetailsSheet } from "../day-details-sheet";
import { FeaturedDayCard } from "../featured-day-card";
import { ProgressSummary } from "../progress-summary";
import { UpcomingDays } from "../upcoming-days";
import { challengeAppClasses } from "./challenge-app.styles";

export function ChallengeApp() {
  const { challenge, loading, error } = useFeaturedChallenge();
  const { progressMap, toggleDayDone } = useLocalChallengeProgress(
    challenge?.run.slug ?? null,
  );
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

  const viewModel = useMemo(
    () => buildChallengeViewModel(challenge, progressMap),
    [challenge, progressMap],
  );

  const selectedDay = useMemo<TChallengeDayView | null>(() => {
    if (!viewModel) return null;
    return (
      viewModel.days.find((day) => day.id === selectedDayId) ??
      viewModel.featuredDay
    );
  }, [selectedDayId, viewModel]);

  const handleOpenDay = (dayId: number) => {
    setSelectedDayId(dayId);
  };

  const handleToggleDayDone = (dayNumber: number) => {
    toggleDayDone(dayNumber);
  };

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
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedDayId(null);
                }
              }}
              onToggleDayDone={handleToggleDayDone}
            />
          </>
        )}
      </div>
    </div>
  );
}
