import type { TCalendarDay } from "../../lib/challenge";
import { monthOverviewClasses } from "./month-overview.styles";

type TStatusIconConfig = {
  label: string;
  className: string;
};

export const getStatusIconConfig = (day: TCalendarDay): TStatusIconConfig => {
  if (day.isFuture || day.isLocked) {
    return { label: "•", className: monthOverviewClasses.iconMuted };
  }

  if (day.isDone) {
    return { label: "✓", className: monthOverviewClasses.iconDone };
  }

  return { label: "✕", className: monthOverviewClasses.iconMissed };
};

export const getDaySummary = (day: TCalendarDay) => {
  if (day.row?.exercises) {
    return day.row.exercises.split(",")[0]?.trim();
  }

  if (day.isLocked) return "Locked";
  if (day.isFuture) return "Upcoming";
  return "No plan";
};

export const getDayExercisesLabel = (day: TCalendarDay) => {
  if (day.row?.exercises) {
    const items = day.row.exercises
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length) {
      return items.join(" · ");
    }
  }

  if (day.isLocked) return "Locked";
  if (day.isFuture) return "Upcoming";
  return "No plan";
};

export const getDayDateLabel = (day: TCalendarDay) => {
  const raw = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(day.date);

  const parts = raw.split(" ");
  if (parts.length === 2 && !parts[1].endsWith(".")) {
    return `${parts[0]} ${parts[1]}.`;
  }

  return raw;
};
