import clsx from "clsx";
import { WEEK_DAYS } from "../../lib/challenge";
import { monthOverviewClasses } from "./month-overview.styles";
import { getStatusIconConfig } from "./month-overview.utils";
import type { IMonthOverviewProps } from "./month-overview.types";

export function MonthOverview({
  monthLabel,
  startOffset,
  calendarDays,
}: IMonthOverviewProps) {
  return (
    <div className={monthOverviewClasses.card}>
      <div className={monthOverviewClasses.label}>Month Overview</div>
      <h3 className={monthOverviewClasses.title}>{monthLabel}</h3>
      <div className={monthOverviewClasses.weekRow}>
        {WEEK_DAYS.map((day) => (
          <div key={day} className={monthOverviewClasses.weekCell}>
            {day}
          </div>
        ))}
      </div>
      <div className={monthOverviewClasses.grid}>
        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {calendarDays.map((day) => {
          const statusIcon = getStatusIconConfig(day);

          return (
            <div
              key={day.dateKey}
              className={clsx(
                monthOverviewClasses.dayCardBase,
                day.isToday && monthOverviewClasses.dayCardToday,
                day.isLocked && monthOverviewClasses.dayCardLocked,
                day.isFuture &&
                  !day.isLocked &&
                  monthOverviewClasses.dayCardFuture,
                day.isPast &&
                  !day.isLocked &&
                  !day.isDone &&
                  monthOverviewClasses.dayCardPast,
                day.isDone && monthOverviewClasses.dayCardDone,
              )}
            >
              <div className={monthOverviewClasses.dayHeader}>
                <span className={monthOverviewClasses.dayNumber}>
                  {day.date.getDate()}
                </span>
                <span className={statusIcon.className}>{statusIcon.label}</span>
              </div>
              <div className={monthOverviewClasses.daySummary}>
                {day.row?.exercises
                  ? day.row.exercises.split(",")[0]?.trim()
                  : day.isLocked
                    ? "Locked"
                    : day.isFuture
                      ? "Upcoming"
                      : "No plan"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
