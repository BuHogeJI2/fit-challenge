import { addDays, formatShortDate, getMonthKey, getMonthRange, shiftMonth } from "../../lib/dates";
import type { TAxisLabel } from "./line-chart.types";

const MONTH_LABEL_DAYS = [1, 8, 15, 22, 29];
const MAX_RANGE_LABELS = 6;
const WEEK_LABEL_STEP = 3;

const shortMonth = (monthKey: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(`${monthKey}-01T00:00:00Z`),
  );

export const getMonthAxisLabels = (monthKey: string): TAxisLabel[] => {
  const { end } = getMonthRange(monthKey);

  return MONTH_LABEL_DAYS.map((day) => `${monthKey}-${String(day).padStart(2, "0")}`)
    .filter((date) => date <= end)
    .map((date) => ({ date, label: String(Number(date.slice(8))) }));
};

export const getRangeAxisLabels = (startKey: string, endKey: string): TAxisLabel[] => {
  const months: string[] = [];
  for (
    let monthKey = shiftMonth(getMonthKey(startKey), 1);
    monthKey <= getMonthKey(endKey);
    monthKey = shiftMonth(monthKey, 1)
  ) {
    months.push(monthKey);
  }

  if (!months.length) {
    return [{ date: startKey, label: shortMonth(getMonthKey(startKey)) }];
  }

  const spansYears = startKey.slice(0, 4) !== endKey.slice(0, 4);
  const step = Math.ceil(months.length / MAX_RANGE_LABELS);
  return months
    .filter((_, index) => index % step === 0)
    .map((monthKey, index) => ({
      date: `${monthKey}-01`,
      label:
        spansYears && (index === 0 || monthKey.endsWith("-01"))
          ? `${shortMonth(monthKey)} ${monthKey.slice(0, 4)}`
          : shortMonth(monthKey),
    }));
};

// A week's value sits in the middle of its seven days, between the daily dots.
export const getWeekMiddle = (weekStart: string) => addDays(weekStart, 3);

export const getWeekAxisLabels = (weekStarts: readonly string[]): TAxisLabel[] =>
  weekStarts
    .filter((_, index) => index % WEEK_LABEL_STEP === 0)
    .map((weekStart) => ({ date: getWeekMiddle(weekStart), label: formatShortDate(weekStart) }));
