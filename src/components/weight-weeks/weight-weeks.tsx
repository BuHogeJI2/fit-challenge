import { addDays, formatDateRange, getWeekStart } from "../../lib/dates";
import { formatSignedWeightValue, formatWeightValue } from "../../lib/numbers";
import { weightWeeksClasses } from "./weight-weeks.styles";
import type { IWeightWeeksProps } from "./weight-weeks.types";

export function WeightWeeks({ weeks, todayKey }: IWeightWeeksProps) {
  if (!weeks.length) {
    return null;
  }

  const currentWeek = getWeekStart(todayKey);

  return (
    <ol className={weightWeeksClasses.list} aria-label="Weeks">
      {[...weeks].reverse().map(({ weekStart, count, averageKg, changeKg }) => (
        <li key={weekStart} className={weightWeeksClasses.row}>
          <span className={weightWeeksClasses.week}>
            <span className={weightWeeksClasses.range}>
              {formatDateRange(weekStart, addDays(weekStart, 6), todayKey)}
            </span>
            <span className={weightWeeksClasses.count}>
              {count} weigh-in{count === 1 ? "" : "s"}
              {weekStart === currentWeek ? " so far" : ""}
            </span>
          </span>
          <span className={weightWeeksClasses.values}>
            <span className={weightWeeksClasses.value}>{formatWeightValue(averageKg)}</span>
            <span className={weightWeeksClasses.change}>
              {changeKg === null ? "first" : formatSignedWeightValue(changeKg)}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
