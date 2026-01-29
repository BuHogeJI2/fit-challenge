import clsx from "clsx";
import type { CalendarDay } from "./types";
import { weekDays } from "./utils";

type MonthOverviewProps = {
  monthLabel: string;
  startOffset: number;
  calendarDays: CalendarDay[];
};

export function MonthOverview({
  monthLabel,
  startOffset,
  calendarDays,
}: MonthOverviewProps) {
  const getStatusIcon = (day: CalendarDay) => {
    if (day.isFuture || day.isLocked) {
      return (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/70 bg-slate-950/70 text-[10px] text-slate-500">
          •
        </span>
      );
    }

    if (day.isDone) {
      return (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/15 text-xs font-semibold text-emerald-100">
          ✓
        </span>
      );
    }

    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10 text-xs font-semibold text-rose-200">
        ✕
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-soft">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Month Overview
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-white">{monthLabel}</h3>
      <div className="mt-4 grid grid-cols-7 gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {weekDays.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {calendarDays.map((day) => (
          <div
            key={day.dateKey}
            className={clsx(
              "flex flex-col justify-between gap-2 overflow-hidden rounded-2xl border px-2.5 py-2.5 text-xs transition",
              day.isToday &&
                "border-emerald-400/60 bg-emerald-500/10 text-emerald-50",
              day.isLocked &&
                "border-slate-900/80 bg-slate-950/70 text-slate-600",
              day.isFuture &&
                !day.isLocked &&
                "border-slate-800/70 bg-slate-950/60 text-slate-500",
              day.isPast &&
                !day.isLocked &&
                !day.isDone &&
                "border-slate-800/80 bg-slate-900/70 text-slate-300",
              day.isDone &&
                "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
            )}
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="shrink-0 text-sm font-semibold">
                {day.date.getDate()}
              </span>
              {getStatusIcon(day)}
            </div>
            <div className="truncate text-[11px] leading-tight text-slate-400">
              {day.row?.exercises
                ? day.row.exercises.split(",")[0]?.trim()
                : day.isLocked
                  ? "Locked"
                  : day.isFuture
                    ? "Upcoming"
                    : "No plan"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
