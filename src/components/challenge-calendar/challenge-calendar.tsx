import clsx from "clsx";
import { getDayStateLabel, WEEKDAY_SHORT_LABELS } from "../../lib/challenge";
import { challengeCalendarClasses } from "./challenge-calendar.styles";
import type { IChallengeCalendarProps } from "./challenge-calendar.types";

const getDayButtonClassName = (state: string) => {
  switch (state) {
    case "today":
      return challengeCalendarClasses.dayButtonToday;
    case "done_local":
      return challengeCalendarClasses.dayButtonDone;
    case "elapsed":
      return challengeCalendarClasses.dayButtonElapsed;
    default:
      return challengeCalendarClasses.dayButtonUpcoming;
  }
};

export function ChallengeCalendar({
  months,
  onOpenDay,
}: IChallengeCalendarProps) {
  return (
    <section className={challengeCalendarClasses.wrapper}>
      <div className={challengeCalendarClasses.header}>
        <div>
          <h2 className={challengeCalendarClasses.title}>Calendar</h2>
          <p className={challengeCalendarClasses.subtitle}>
            Browse the full run without losing the mobile flow.
          </p>
        </div>
      </div>

      {months.map((month) => (
        <div key={month.key} className={challengeCalendarClasses.monthSection}>
          <h3 className={challengeCalendarClasses.monthTitle}>{month.label}</h3>
          <div className={challengeCalendarClasses.weekRow}>
            {WEEKDAY_SHORT_LABELS.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className={challengeCalendarClasses.grid}>
            {Array.from({ length: month.offset }).map((_, index) => (
              <div
                key={`${month.key}-empty-${index}`}
                className={challengeCalendarClasses.emptyCell}
              />
            ))}
            {month.days.map((day) => (
              <button
                key={day.id}
                type="button"
                className={clsx(
                  challengeCalendarClasses.dayButtonBase,
                  getDayButtonClassName(day.state),
                )}
                onClick={() => onOpenDay(day.id)}
                aria-label={`Open ${day.title} for ${day.longDateLabel}. ${getDayStateLabel(
                  day.state,
                )}.`}
              >
                <span className={challengeCalendarClasses.dayNumber}>
                  {day.dayNumber}
                </span>
                <span className={challengeCalendarClasses.state}>
                  {getDayStateLabel(day.state)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
