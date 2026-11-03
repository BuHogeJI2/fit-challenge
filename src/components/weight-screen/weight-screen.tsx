import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  addDays,
  formatDateInContext,
  formatDateRange,
  formatMonthLabel,
  formatRelativeDate,
  getMonthKey,
  getMonthRange,
  getWeekStart,
  shiftMonth,
  useToday,
} from "../../lib/dates";
import {
  deleteWeightEntry,
  getSettings,
  listWeightEntries,
  restoreWeightEntry,
  type TPendingUndo,
  type TWeightEntry,
} from "../../lib/db";
import { formatKg, formatSignedWeightValue, formatWeightValue } from "../../lib/numbers";
import {
  getEntriesInMonth,
  getMonthWeightSummary,
  getWeeklyWeights,
  getWeekWindow,
  getWeightSummary,
  getWindowLastWeek,
  WEEKS_PER_WINDOW,
  withChangeFromPrevious,
} from "../../lib/stats";
import { LineChart } from "../charts";
import { useToast } from "../ui";
import { WeightEntryForm } from "../weight-entry-form";
import { WeightEntrySheet } from "../weight-entry-sheet";
import { WeightJournal } from "../weight-journal";
import { WeightWeeks } from "../weight-weeks";
import { weightScreenClasses } from "./weight-screen.styles";
import type { TWeightSheetState, TWeightView } from "./weight-screen.types";
import {
  getMonthAxisLabels,
  getRangeAxisLabels,
  getWeekAxisLabels,
  getWeekMiddle,
} from "../charts/axis-labels";

const VIEWS: { view: TWeightView; label: string }[] = [
  { view: "month", label: "Month" },
  { view: "weeks", label: "Weeks" },
  { view: "all", label: "All" },
];

export function WeightScreen() {
  const todayKey = useToday();
  const entries = useLiveQuery(listWeightEntries, []);
  const settings = useLiveQuery(getSettings, []);
  const toast = useToast();
  const [view, setView] = useState<TWeightView>("month");
  const [monthKey, setMonthKey] = useState(() => getMonthKey(todayKey));
  const [lastWeek, setLastWeek] = useState(() => getWeekStart(todayKey));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [sheet, setSheet] = useState<TWeightSheetState>(null);

  if (!entries || !settings) {
    return null;
  }

  const formatDate = (dateKey: string) => formatDateInContext(dateKey, todayKey);

  const showSaved = (saved: TWeightEntry) => {
    setSelectedDate(saved.date);
    setMonthKey(getMonthKey(saved.date));
    setSelectedWeek(getWeekStart(saved.date));
    setLastWeek(getWindowLastWeek(saved.date, todayKey));
  };

  const handleUndo = async (undo: TPendingUndo<TWeightEntry>) => {
    try {
      if (await restoreWeightEntry(undo)) {
        showSaved(undo.record);
      } else {
        toast.show({ message: "Undo is no longer available." });
      }
    } catch {
      toast.show({ message: "Could not undo. Nothing was changed." });
    }
  };

  const handleDelete = async (entry: TWeightEntry) => {
    const undo = await deleteWeightEntry(entry.id);

    setSheet(null);
    if (!undo) return;

    toast.show({
      message: `Deleted ${formatDate(entry.date)}, ${formatKg(entry.weightKg)}`,
      action: { label: "Undo", onAction: () => handleUndo(undo) },
    });
  };

  const entrySheet = (
    <WeightEntrySheet
      state={sheet}
      entries={entries}
      todayKey={todayKey}
      onClose={() => setSheet(null)}
      onSaved={(saved) => {
        setSheet(null);
        showSaved(saved);
      }}
      onDelete={handleDelete}
    />
  );

  if (!entries.length) {
    return (
      <section className={weightScreenClasses.screen}>
        <h1 className={weightScreenClasses.title}>{formatMonthLabel(getMonthKey(todayKey), todayKey)}</h1>
        <p className={weightScreenClasses.subline}>No weigh-ins yet</p>
        <div className={weightScreenClasses.firstUse}>
          <WeightEntryForm
            entry={null}
            entries={entries}
            todayKey={todayKey}
            lead="This morning I weigh"
            submitLabel="Start the journal"
            onSaved={showSaved}
          />
          <p className={weightScreenClasses.subline}>
            The line starts with your second weigh-in.
          </p>
        </div>
      </section>
    );
  }

  const summary = getWeightSummary(entries, settings.goalWeightKg);
  const currentMonthKey = getMonthKey(todayKey);
  const firstMonthKey = getMonthKey(entries[0].date);
  const currentWeek = getWeekStart(todayKey);
  const firstWeek = getWeekStart(entries[0].date);
  const rows = withChangeFromPrevious(entries);
  const monthSummary = getMonthWeightSummary(entries, monthKey);
  const weekWindow = getWeekWindow(lastWeek);
  const windowEntries = entries.filter(
    (entry) => entry.date >= weekWindow.start && entry.date <= weekWindow.end,
  );
  const visibleWeeks = getWeeklyWeights(entries).filter(
    (week) => week.weekStart >= weekWindow.start && week.weekStart <= weekWindow.end,
  );
  const windowWeekStarts = Array.from({ length: WEEKS_PER_WINDOW }, (_, index) =>
    addDays(weekWindow.start, index * 7),
  );
  const formatWeek = (weekStart: string) =>
    formatDateRange(weekStart, addDays(weekStart, 6), todayKey);
  const countWeighIns = (count: number) => `${count} weigh-in${count === 1 ? "" : "s"}`;

  const visibleEntries =
    view === "month" ? getEntriesInMonth(entries, monthKey) : entries;
  const selected =
    visibleEntries.find((entry) => entry.date === selectedDate) ??
    visibleEntries[visibleEntries.length - 1] ??
    null;
  const selectedWeekData =
    visibleWeeks.find((week) => week.weekStart === selectedWeek) ??
    visibleWeeks[visibleWeeks.length - 1] ??
    null;

  const chart =
    view === "weeks"
      ? {
          points: visibleWeeks.map((week) => ({
            date: getWeekMiddle(week.weekStart),
            value: week.averageKg,
          })),
          backgroundPoints: windowEntries.map((entry) => ({
            date: entry.date,
            value: entry.weightKg,
          })),
          domain: weekWindow,
          xLabels: getWeekAxisLabels(windowWeekStarts),
          selectedDate: selectedWeekData ? getWeekMiddle(selectedWeekData.weekStart) : null,
          onSelect: (date: string) => setSelectedWeek(getWeekStart(date)),
          readout: selectedWeekData
            ? `${formatWeek(selectedWeekData.weekStart)} · avg ${formatKg(selectedWeekData.averageKg)}`
            : null,
          label: visibleWeeks.length
            ? `Weekly average weight chart, ${visibleWeeks.length} weeks from ${formatWeek(visibleWeeks[0].weekStart)} to ${formatWeek(visibleWeeks[visibleWeeks.length - 1].weekStart)}`
            : "",
          empty: "Nothing logged in these weeks.",
        }
      : {
          points: visibleEntries.map((entry) => ({ date: entry.date, value: entry.weightKg })),
          backgroundPoints: [],
          domain:
            view === "month"
              ? getMonthRange(monthKey)
              : { start: entries[0].date, end: entries[entries.length - 1].date },
          xLabels:
            view === "month"
              ? getMonthAxisLabels(monthKey)
              : getRangeAxisLabels(entries[0].date, entries[entries.length - 1].date),
          selectedDate: selected?.date ?? null,
          onSelect: setSelectedDate,
          readout: selected ? `${formatDate(selected.date)} · ${formatKg(selected.weightKg)}` : null,
          label: visibleEntries.length
            ? `Weight chart, ${visibleEntries.length} weigh-ins from ${formatDate(visibleEntries[0].date)} to ${formatDate(visibleEntries[visibleEntries.length - 1].date)}`
            : "",
          empty: "Nothing logged in this month.",
        };

  const nav =
    view === "month"
      ? {
          title: formatMonthLabel(monthKey, todayKey),
          previousLabel: "Previous month",
          nextLabel: "Next month",
          isFirst: monthKey <= firstMonthKey,
          isLast: monthKey >= currentMonthKey,
          onPrevious: () => setMonthKey(shiftMonth(monthKey, -1)),
          onNext: () => setMonthKey(shiftMonth(monthKey, 1)),
        }
      : view === "weeks"
        ? {
            title: "Weeks",
            previousLabel: `Previous ${WEEKS_PER_WINDOW} weeks`,
            nextLabel: `Next ${WEEKS_PER_WINDOW} weeks`,
            isFirst: weekWindow.start <= firstWeek,
            isLast: lastWeek >= currentWeek,
            onPrevious: () => setLastWeek(addDays(lastWeek, -WEEKS_PER_WINDOW * 7)),
            onNext: () => setLastWeek(addDays(lastWeek, WEEKS_PER_WINDOW * 7)),
          }
        : null;

  const subline =
    view === "month"
      ? monthSummary.count
        ? `${countWeighIns(monthSummary.count)} · average ${formatWeightValue(monthSummary.averageKg!)} · range ${formatWeightValue(monthSummary.minKg!)}–${formatWeightValue(monthSummary.maxKg!)}`
        : "No weigh-ins this month"
      : view === "weeks"
        ? `${formatDateRange(weekWindow.start, weekWindow.end, todayKey)} · ${windowEntries.length ? countWeighIns(windowEntries.length) : "no weigh-ins"}`
        : `${countWeighIns(entries.length)} since ${formatDate(entries[0].date)}`;

  return (
    <section className={weightScreenClasses.screen}>
      <div className={weightScreenClasses.titleRow}>
        <h1 className={weightScreenClasses.title}>{nav ? nav.title : "All time"}</h1>
        {nav ? (
          <div className={weightScreenClasses.monthNav}>
            <button
              type="button"
              className={weightScreenClasses.iconButton}
              aria-label={nav.previousLabel}
              disabled={nav.isFirst}
              onClick={nav.onPrevious}
            >
              <svg viewBox="0 0 18 18" aria-hidden="true" className={weightScreenClasses.icon}>
                <path d="M11 3.5 5.5 9l5.5 5.5" />
              </svg>
            </button>
            <button
              type="button"
              className={weightScreenClasses.iconButton}
              aria-label={nav.nextLabel}
              disabled={nav.isLast}
              onClick={nav.onNext}
            >
              <svg viewBox="0 0 18 18" aria-hidden="true" className={weightScreenClasses.icon}>
                <path d="m7 3.5 5.5 5.5L7 14.5" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div className={weightScreenClasses.viewSwitch} role="group" aria-label="Chart range">
        {VIEWS.map((option) => (
          <button
            key={option.view}
            type="button"
            aria-pressed={view === option.view}
            className={view === option.view ? weightScreenClasses.viewActive : weightScreenClasses.view}
            onClick={() => setView(option.view)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className={weightScreenClasses.subline}>{subline}</p>

      <dl className={weightScreenClasses.stats}>
        <div className={weightScreenClasses.stat}>
          <dt className={weightScreenClasses.statLabel}>Latest</dt>
          <dd className={weightScreenClasses.statValue}>
            {formatKg(summary.latest!.weightKg)}
            <span className={weightScreenClasses.statNote}>
              {formatRelativeDate(summary.latest!.date, todayKey)}
            </span>
          </dd>
        </div>
        {summary.changeSinceFirstKg !== null ? (
          <div className={weightScreenClasses.stat}>
            <dt className={weightScreenClasses.statLabel}>
              Since {formatDate(summary.first!.date)}
            </dt>
            <dd className={weightScreenClasses.statValue}>
              {formatSignedWeightValue(summary.changeSinceFirstKg)} kg
            </dd>
          </div>
        ) : null}
        {summary.toGoalKg !== null ? (
          <div className={weightScreenClasses.stat}>
            <dt className={weightScreenClasses.statLabel}>
              Goal {formatWeightValue(settings.goalWeightKg!)}
            </dt>
            <dd className={weightScreenClasses.statValue}>
              {summary.toGoalKg > 0 ? `${formatKg(summary.toGoalKg)} to go` : "Reached"}
            </dd>
          </div>
        ) : null}
      </dl>

      {chart.points.length ? (
        <div className={weightScreenClasses.chart}>
          <p className={weightScreenClasses.readout} aria-live="polite">
            {chart.readout}
          </p>
          <LineChart
            points={chart.points}
            backgroundPoints={chart.backgroundPoints}
            startKey={chart.domain.start}
            endKey={chart.domain.end}
            xLabels={chart.xLabels}
            goalValue={settings.goalWeightKg}
            fitGoal={view === "all"}
            selectedDate={chart.selectedDate}
            onSelect={chart.onSelect}
            formatValue={formatWeightValue}
            unit="kg"
            minSpan={1}
            label={chart.label}
          />
          {entries.length === 1 ? (
            <p className={weightScreenClasses.subline}>
              The line starts with your second weigh-in.
            </p>
          ) : null}
        </div>
      ) : (
        <p className={weightScreenClasses.empty}>{chart.empty}</p>
      )}

      {view === "weeks" ? (
        <WeightWeeks weeks={visibleWeeks} todayKey={todayKey} />
      ) : (
        <WeightJournal
          rows={
            view === "month"
              ? rows.filter(({ entry }) => getMonthKey(entry.date) === monthKey)
              : rows
          }
          showMonth={view === "all"}
          todayKey={todayKey}
          onEdit={(entry) => setSheet({ mode: "edit", entry })}
        />
      )}

      <button
        type="button"
        className={weightScreenClasses.fab}
        aria-label="Log weight"
        onClick={() => setSheet({ mode: "new" })}
      >
        <svg viewBox="0 0 22 22" aria-hidden="true" className={weightScreenClasses.fabIcon}>
          <path d="M11 4v14M4 11h14" />
        </svg>
      </button>

      {entrySheet}
    </section>
  );
}
