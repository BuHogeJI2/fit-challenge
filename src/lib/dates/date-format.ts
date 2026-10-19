import { differenceInDays, parseDateKey } from "./dates";

const toUtcDate = (dateKey: string) => {
  const parts = parseDateKey(dateKey);
  if (!parts) {
    throw new RangeError("Expected a valid YYYY-MM-DD date.");
  }

  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return date;
};

const format = (dateKey: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    toUtcDate(dateKey),
  );

export const formatShortDate = (dateKey: string) =>
  format(dateKey, { month: "short", day: "numeric" });

export const formatDateInContext = (dateKey: string, todayKey: string) =>
  dateKey.slice(0, 4) === todayKey.slice(0, 4)
    ? formatShortDate(dateKey)
    : format(dateKey, { month: "short", day: "numeric", year: "numeric" });

export const formatLongDate = (dateKey: string) =>
  format(dateKey, { weekday: "long", month: "short", day: "numeric" });

export const formatWeekdayShort = (dateKey: string) => format(dateKey, { weekday: "short" });

export const formatDayOfMonth = (dateKey: string) => String(parseDateKey(dateKey)?.day ?? "");

export const formatMonthLabel = (monthKey: string, todayKey: string) =>
  format(
    `${monthKey}-01`,
    monthKey.slice(0, 4) === todayKey.slice(0, 4)
      ? { month: "long" }
      : { month: "long", year: "numeric" },
  );

export const formatRelativeDate = (dateKey: string, todayKey: string) => {
  const daysAgo = differenceInDays(todayKey, dateKey);

  if (daysAgo === 0) return "today";
  if (daysAgo === 1) return "yesterday";
  return formatDateInContext(dateKey, todayKey);
};
