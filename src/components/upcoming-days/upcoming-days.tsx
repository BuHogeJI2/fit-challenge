import {
  formatExerciseNameForDisplay,
  formatExerciseTarget,
} from "../../lib/challenge";
import { upcomingDaysClasses } from "./upcoming-days.styles";
import type { IUpcomingDaysProps } from "./upcoming-days.types";

export function UpcomingDays({ days, onOpenDay }: IUpcomingDaysProps) {
  return (
    <section className={upcomingDaysClasses.wrapper}>
      <div className={upcomingDaysClasses.headingRow}>
        <div>
          <h2 className={upcomingDaysClasses.title}>Next 3 days</h2>
          <p className={upcomingDaysClasses.description}>
            Look ahead without leaving the main screen.
          </p>
        </div>
      </div>

      {days.length ? (
        <div className={upcomingDaysClasses.list}>
          {days.map((day) => (
            <button
              key={day.id}
              type="button"
              className={upcomingDaysClasses.card}
              onClick={() => onOpenDay(day.id)}
              aria-label={`Open ${day.title} for ${day.shortDateLabel}`}
            >
              <div className={upcomingDaysClasses.topRow}>
                <span className={upcomingDaysClasses.dayLabel}>{day.shortDateLabel}</span>
                <span className={upcomingDaysClasses.weekday}>{day.relativeLabel}</span>
              </div>
              <div className={upcomingDaysClasses.cardTitle}>{day.title}</div>
              {day.exercises.length ? (
                <div className={upcomingDaysClasses.exerciseList}>
                  {day.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={upcomingDaysClasses.exerciseRow}
                    >
                      <span className={upcomingDaysClasses.exerciseName}>
                        {formatExerciseNameForDisplay(exercise.exerciseName)}
                      </span>
                      <span className={upcomingDaysClasses.exerciseTarget}>
                        {formatExerciseTarget(exercise)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={upcomingDaysClasses.fallback}>
                  Workout details coming soon
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className={upcomingDaysClasses.empty}>
          No future days remain in this run.
        </p>
      )}
    </section>
  );
}
