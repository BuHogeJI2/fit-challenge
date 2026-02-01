import { useMemo } from "react";
import { ChallengeHeader } from "../challenge-header/challenge-header";
import { CurrentDayCard } from "../current-day-card/current-day-card";
import { MonthOverview } from "../month-overview/month-overview";
import { StatusBanner } from "../status-banner/status-banner";
import type { TCalendarDay } from "../../lib/challenge";
import {
  CHALLENGE_LENGTH_DAYS,
  CHALLENGE_START_DATE,
  addDays,
  clampDate,
  formatDate,
  getDateKey,
  parseExercises,
  parseIsoDate,
  useChallengeDays,
} from "../../lib/challenge";
import { challengeAppClasses } from "./challenge-app.styles";

export function ChallengeApp() {
  const { days, loading, error } = useChallengeDays();

  const today = useMemo(() => new Date(), []);
  const challengeStart = useMemo(() => parseIsoDate(CHALLENGE_START_DATE), []);
  const challengeEnd = useMemo(
    () => addDays(challengeStart, CHALLENGE_LENGTH_DAYS - 1),
    [challengeStart],
  );

  const todayKey = useMemo(() => getDateKey(today), [today]);
  const challengeStartKey = useMemo(
    () => getDateKey(challengeStart),
    [challengeStart],
  );
  const challengeEndKey = useMemo(
    () => getDateKey(challengeEnd),
    [challengeEnd],
  );

  const focusDate = useMemo(
    () => clampDate(today, challengeStart, challengeEnd),
    [today, challengeStart, challengeEnd],
  );
  const focusKey = useMemo(() => getDateKey(focusDate), [focusDate]);

  const isBeforeStart = todayKey < challengeStartKey;
  const isAfterEnd = todayKey > challengeEndKey;

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(focusDate),
    [focusDate],
  );

  const daysByKey = useMemo(() => {
    return new Map(days.map((day) => [day.date, day]));
  }, [days]);

  const daysInMonth = useMemo(
    () =>
      new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 0).getDate(),
    [focusDate],
  );
  const startOffset = useMemo(
    () => new Date(focusDate.getFullYear(), focusDate.getMonth(), 1).getDay(),
    [focusDate],
  );

  const calendarDays = useMemo<TCalendarDay[]>(
    () =>
      Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(
          focusDate.getFullYear(),
          focusDate.getMonth(),
          index + 1,
        );
        const dateKey = getDateKey(date);
        const row = daysByKey.get(dateKey);
        const isToday = dateKey === focusKey;
        const isFuture = dateKey > focusKey;
        const isPast = dateKey < focusKey;
        const isDone = Boolean(row?.is_done);
        const isLocked =
          dateKey < challengeStartKey || dateKey > challengeEndKey;

        let status = "Locked";
        if (!isLocked) {
          if (isToday) {
            status = "Today";
          } else if (isFuture) {
            status = "Upcoming";
          } else if (isDone) {
            status = "Done";
          } else {
            status = row ? "Missed" : "No Plan";
          }
        }

        return {
          date,
          dateKey,
          row,
          isToday,
          isFuture,
          isPast,
          isDone,
          isLocked,
          status,
        };
      }),
    [
      challengeEndKey,
      challengeStartKey,
      daysByKey,
      daysInMonth,
      focusDate,
      focusKey,
    ],
  );

  const focusRow = daysByKey.get(focusKey);
  const focusExercises = parseExercises(focusRow?.exercises);
  const completedCount = days.filter((day) => day.is_done).length;

  const cardLabel = isBeforeStart
    ? "Challenge Starts"
    : isAfterEnd
      ? "Challenge Ended"
      : "Current Day";

  const cardTitle = isBeforeStart
    ? "Day 1 Preview"
    : isAfterEnd
      ? "Final Day Recap"
      : "Today's Goal";

  const cardDescription = isBeforeStart
    ? `The 30-day plan begins on ${formatDate(
        challengeStart,
      )}. Here's the first workout.`
    : isAfterEnd
      ? `You wrapped up the challenge on ${formatDate(
          challengeEnd,
        )}. Take a look at the final day.`
      : focusRow?.exercises
        ? "Finish the workout below and keep your streak alive."
        : "No exercises were scheduled for today.";

  const emptyMessage = isBeforeStart
    ? "No exercises listed for day 1 yet."
    : "No exercises listed. Check back later or update the plan in Supabase.";

  return (
    <div className={challengeAppClasses.container}>
      <div className={challengeAppClasses.content}>
        <ChallengeHeader completedCount={completedCount} />

        <section className={challengeAppClasses.mainGrid}>
          <CurrentDayCard
            label={cardLabel}
            dateLabel={formatDate(focusDate)}
            title={cardTitle}
            description={cardDescription}
            exercises={focusExercises}
            emptyMessage={emptyMessage}
          />

          <MonthOverview
            monthLabel={monthLabel}
            startOffset={startOffset}
            calendarDays={calendarDays}
          />
        </section>

        <section className={challengeAppClasses.statusSection}>
          <StatusBanner
            loading={loading}
            error={error}
            daysCount={days.length}
          />
        </section>
      </div>
    </div>
  );
}
