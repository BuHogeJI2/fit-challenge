import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
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
  const [closingDayKey, setClosingDayKey] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!activeDayKey) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const tooltipEl = document.querySelector(
        `[data-tooltip-day="${activeDayKey}"]`,
      );

      if (tooltipEl && target && tooltipEl.contains(target)) {
        return;
      }

      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setClosingDayKey(activeDayKey);
      closeTimeoutRef.current = window.setTimeout(() => {
        setActiveDayKey(null);
        setClosingDayKey(null);
      }, 180);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [activeDayKey]);

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
              onClick={() => {
                clearCloseTimeout();
                setClosingDayKey(null);
                setActiveDayKey(day.dateKey);
              }}
            >
              {isTooltipVisible ? (
                <div
                  data-tooltip-day={day.dateKey}
                  className={monthOverviewClasses.tooltipWrapper}
                >
                  <DaySummaryTooltip
                    dateLabel={dayDateLabel}
                    exercisesLabel={exercisesLabel}
                    state={closingDayKey === day.dateKey ? "closing" : "open"}
                  />
                </div>
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
