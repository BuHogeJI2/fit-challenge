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
