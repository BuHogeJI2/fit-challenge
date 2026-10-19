import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  formatDateInContext,
  formatMonthLabel,
  formatRelativeDate,
  getMonthKey,
  getMonthRange,
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
  getWeightSummary,
  withChangeFromPrevious,
} from "../../lib/stats";
import { LineChart } from "../charts";
import { useToast } from "../ui";
import { WeightEntryForm } from "../weight-entry-form";
import { WeightEntrySheet } from "../weight-entry-sheet";
import { WeightJournal } from "../weight-journal";
import { weightScreenClasses } from "./weight-screen.styles";
import type { TWeightSheetState, TWeightView } from "./weight-screen.types";
import { getMonthAxisLabels, getRangeAxisLabels } from "../charts/axis-labels";

export function WeightScreen() {
  const todayKey = useToday();
  const entries = useLiveQuery(listWeightEntries, []);
  const settings = useLiveQuery(getSettings, []);
  const toast = useToast();
  const [view, setView] = useState<TWeightView>("month");
  const [monthKey, setMonthKey] = useState(() => getMonthKey(todayKey));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheet, setSheet] = useState<TWeightSheetState>(null);

  if (!entries || !settings) {
    return null;
  }

  const formatDate = (dateKey: string) => formatDateInContext(dateKey, todayKey);

  const showSaved = (saved: TWeightEntry) => {
    setSelectedDate(saved.date);
    setMonthKey(getMonthKey(saved.date));
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
  const rows = withChangeFromPrevious(entries);

  const visibleEntries =
    view === "month" ? getEntriesInMonth(entries, monthKey) : entries;
  const visibleRows =
    view === "month"
      ? rows.filter(({ entry }) => getMonthKey(entry.date) === monthKey)
      : rows;
  const domain =
    view === "month"
      ? getMonthRange(monthKey)
      : { start: entries[0].date, end: entries[entries.length - 1].date };
  const xLabels =
    view === "month"
      ? getMonthAxisLabels(monthKey)
      : getRangeAxisLabels(domain.start, domain.end);
  const selected =
    visibleEntries.find((entry) => entry.date === selectedDate) ??
    visibleEntries[visibleEntries.length - 1] ??
    null;
  const monthSummary = getMonthWeightSummary(entries, monthKey);

  return (
    <section className={weightScreenClasses.screen}>
      <div className={weightScreenClasses.titleRow}>
        <h1 className={weightScreenClasses.title}>
          {view === "month" ? formatMonthLabel(monthKey, todayKey) : "All time"}
        </h1>
        {view === "month" ? (
          <div className={weightScreenClasses.monthNav}>
            <button
              type="button"
              className={weightScreenClasses.iconButton}
              aria-label="Previous month"
              disabled={monthKey <= firstMonthKey}
              onClick={() => setMonthKey(shiftMonth(monthKey, -1))}
            >
              <svg viewBox="0 0 18 18" aria-hidden="true" className={weightScreenClasses.icon}>
                <path d="M11 3.5 5.5 9l5.5 5.5" />
              </svg>
            </button>
            <button
              type="button"
              className={weightScreenClasses.iconButton}
              aria-label="Next month"
              disabled={monthKey >= currentMonthKey}
              onClick={() => setMonthKey(shiftMonth(monthKey, 1))}
            >
              <svg viewBox="0 0 18 18" aria-hidden="true" className={weightScreenClasses.icon}>
                <path d="m7 3.5 5.5 5.5L7 14.5" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div className={weightScreenClasses.viewSwitch} role="group" aria-label="Chart range">
        <button
          type="button"
          aria-pressed={view === "month"}
          className={view === "month" ? weightScreenClasses.viewActive : weightScreenClasses.view}
          onClick={() => setView("month")}
        >
          Month
        </button>
        <button
          type="button"
          aria-pressed={view === "all"}
          className={view === "all" ? weightScreenClasses.viewActive : weightScreenClasses.view}
          onClick={() => setView("all")}
        >
          All
        </button>
      </div>

      <p className={weightScreenClasses.subline}>
        {view === "month"
          ? monthSummary.count
            ? `${monthSummary.count} weigh-in${monthSummary.count === 1 ? "" : "s"} · average ${formatWeightValue(monthSummary.averageKg!)} · range ${formatWeightValue(monthSummary.minKg!)}–${formatWeightValue(monthSummary.maxKg!)}`
            : "No weigh-ins this month"
          : `${entries.length} weigh-in${entries.length === 1 ? "" : "s"} since ${formatDate(entries[0].date)}`}
      </p>

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

      {visibleEntries.length ? (
        <div className={weightScreenClasses.chart}>
          <p className={weightScreenClasses.readout} aria-live="polite">
            {selected
              ? `${formatDate(selected.date)} · ${formatKg(selected.weightKg)}`
              : null}
          </p>
          <LineChart
            points={visibleEntries.map((entry) => ({ date: entry.date, value: entry.weightKg }))}
            startKey={domain.start}
            endKey={domain.end}
            xLabels={xLabels}
            goalValue={settings.goalWeightKg}
            fitGoal={view === "all"}
            selectedDate={selected?.date ?? null}
            onSelect={setSelectedDate}
            formatValue={formatWeightValue}
            unit="kg"
            minSpan={1}
            label={`Weight chart, ${visibleEntries.length} weigh-ins from ${formatDate(visibleEntries[0].date)} to ${formatDate(visibleEntries[visibleEntries.length - 1].date)}`}
          />
          {entries.length === 1 ? (
            <p className={weightScreenClasses.subline}>
              The line starts with your second weigh-in.
            </p>
          ) : null}
        </div>
      ) : (
        <p className={weightScreenClasses.empty}>Nothing logged in this month.</p>
      )}

      <WeightJournal
        rows={visibleRows}
        showMonth={view === "all"}
        todayKey={todayKey}
        onEdit={(entry) => setSheet({ mode: "edit", entry })}
      />

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
