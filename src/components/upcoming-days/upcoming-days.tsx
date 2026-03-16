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
                <span className={upcomingDaysClasses.dayLabel}>
                  {day.shortDateLabel}
                </span>
                <span className={upcomingDaysClasses.date}>{day.relativeLabel}</span>
              </div>
              <div className={upcomingDaysClasses.cardTitle}>{day.title}</div>
              <div className={upcomingDaysClasses.meta}>
                {day.summary ??
                  `${day.exercises.length} exercises scheduled for this session.`}
              </div>
              <div className={upcomingDaysClasses.footer}>
                <span>{day.exercises.length} exercises</span>
                <span>{day.state === "upcoming" ? "Preview only" : day.relativeLabel}</span>
              </div>
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
