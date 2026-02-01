import clsx from "clsx";
import { useState } from "react";
import { WEEK_DAYS } from "../../lib/challenge";
import { DaySummaryTooltip } from "../day-summary-tooltip/day-summary-tooltip";
import { monthOverviewClasses } from "./month-overview.styles";
import type { IMonthOverviewProps } from "./month-overview.types";
import { getDayDateLabel, getDayExercisesLabel } from "./month-overview.utils";

export function MonthOverview({
  monthLabel,
  startOffset,
  calendarDays,
}: IMonthOverviewProps) {
  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);

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
          const dayDateLabel = getDayDateLabel(day);
          const exercisesLabel = getDayExercisesLabel(day);
          const isTooltipVisible = activeDayKey === day.dateKey;

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
              onClick={() => setActiveDayKey(day.dateKey)}
              onMouseLeave={() => {
                if (activeDayKey === day.dateKey) {
                  setActiveDayKey(null);
                }
              }}
            >
              {isTooltipVisible ? (
                <DaySummaryTooltip
                  dateLabel={dayDateLabel}
                  exercisesLabel={exercisesLabel}
                  onMouseLeave={() => setActiveDayKey(null)}
                />
              ) : null}
              <div className={monthOverviewClasses.dayHeader}>
                <span className={monthOverviewClasses.dayNumber}>
                  {day.date.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
