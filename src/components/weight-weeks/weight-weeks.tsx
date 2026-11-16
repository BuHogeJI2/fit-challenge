import { Link } from "wouter";
import { addDays, formatDateRange, formatWeekdayShort, getWeekStart } from "../../lib/dates";
import { formatWeightValue } from "../../lib/numbers";
import { weightWeeksClasses } from "./weight-weeks.styles";
import type { IWeightWeeksProps } from "./weight-weeks.types";

export function WeightWeeks({ weeks, todayKey, getWeekHref, onOpen }: IWeightWeeksProps) {
  if (!weeks.length) {
    return null;
  }

  const currentWeek = getWeekStart(todayKey);

  return (
    <>
      <h2 className={weightWeeksClasses.heading}>Each week</h2>
      <p className={weightWeeksClasses.description}>First → last weigh-in · change within the week</p>
      <ol className={weightWeeksClasses.list} aria-label="Weeks">
        {[...weeks].reverse().map(({ weekStart, count, first, last, changeWithinWeekKg }) => {
          const end = addDays(weekStart, 6);
          const measuredDays = count === 1 ? formatWeekdayShort(first.date)
            : first.date !== weekStart || last.date !== end
              ? `${formatWeekdayShort(first.date)} – ${formatWeekdayShort(last.date)}` : null;
          const change = changeWithinWeekKg === null ? null
            : `${changeWithinWeekKg < 0 ? "↓ " : changeWithinWeekKg > 0 ? "↑ " : ""}${formatWeightValue(Math.abs(changeWithinWeekKg))} kg`;
          return (
            <li key={weekStart} className={weightWeeksClasses.item}>
              <Link href={getWeekHref(weekStart)} onClick={onOpen} className={weightWeeksClasses.row}>
                <span className={weightWeeksClasses.week}>
                  <span className={weightWeeksClasses.rowHead}>
                    <span className={weightWeeksClasses.range}>
                      {formatDateRange(weekStart, end, todayKey)}
                    </span>
                    <span className={weightWeeksClasses.value}>
                      {count === 1 ? formatWeightValue(first.weightKg) : `${formatWeightValue(first.weightKg)} → ${formatWeightValue(last.weightKg)}`} kg
                    </span>
                  </span>
                  <span className={weightWeeksClasses.rowMeta}>
                    <span className={weightWeeksClasses.count}>
                      {count === 1 ? "One weigh-in" : `${count} weigh-ins`}
                      {weekStart === currentWeek ? " so far" : ""}
                      {measuredDays ? ` · ${measuredDays}` : ""}
                    </span>
                    {changeWithinWeekKg !== null ? <span className={weightWeeksClasses.change}>
                      <span aria-hidden="true">{change}</span>
                      <span className={weightWeeksClasses.srOnly}>Change within the week: {changeWithinWeekKg < 0 ? "down" : changeWithinWeekKg > 0 ? "up" : "unchanged"} {formatWeightValue(Math.abs(changeWithinWeekKg))} kg</span>
                    </span> : null}
                  </span>
                </span>
                <span className={weightWeeksClasses.chevron} aria-hidden="true">›</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
