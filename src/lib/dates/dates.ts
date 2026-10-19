import type { TDateParts, TMonthRange } from "./dates.types";

const DAY_IN_MS = 86_400_000;

const getDaysInMonth = (year: number, month: number) => {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

const formatDateParts = ({ year, month, day }: TDateParts) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const parseDateKey = (value: string): TDateParts | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > getDaysInMonth(year, month)
  ) {
    return null;
  }

  return { year, month, day };
};

const requireDateParts = (value: string) => {
  const parts = parseDateKey(value);
  if (!parts) throw new RangeError("Expected a valid YYYY-MM-DD date.");
  return parts;
};

const getCalendarDate = (value: string) => {
  const { year, month, day } = requireDateParts(value);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
};

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new RangeError("Expected a date with a year from 0001 to 9999.");
  }

  return formatDateParts({
    year,
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
};

export const differenceInDays = (left: string, right: string): number =>
  (getCalendarDate(left).getTime() - getCalendarDate(right).getTime()) / DAY_IN_MS;

export const addDays = (dateKey: string, days: number): string => {
  if (!Number.isSafeInteger(days)) {
    throw new RangeError("Expected a whole number of days.");
  }

  const date = getCalendarDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  const year = date.getUTCFullYear();
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new RangeError("The resulting year must be from 0001 to 9999.");
  }

  return formatDateParts({
    year,
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
};

export const getWeekStart = (dateKey: string): string => {
  const weekday = getCalendarDate(dateKey).getUTCDay();
  return addDays(dateKey, -((weekday + 6) % 7));
};

export const getMonthKey = (dateKey: string): string => {
  requireDateParts(dateKey);
  return dateKey.slice(0, 7);
};

export const getMonthRange = (monthKey: string): TMonthRange => {
  const { year, month } = requireDateParts(`${monthKey}-01`);
  return {
    start: `${monthKey}-01`,
    end: formatDateParts({ year, month, day: getDaysInMonth(year, month) }),
  };
};

export const shiftMonth = (monthKey: string, months: number): string => {
  const { year, month } = requireDateParts(`${monthKey}-01`);
  if (!Number.isSafeInteger(months)) {
    throw new RangeError("Expected a whole number of months.");
  }

  const index = (year - 1) * 12 + month - 1 + months;
  if (index < 0 || index >= 9999 * 12) {
    throw new RangeError("The resulting year must be from 0001 to 9999.");
  }

  return `${String(Math.floor(index / 12) + 1).padStart(4, "0")}-${String((index % 12) + 1).padStart(2, "0")}`;
};
