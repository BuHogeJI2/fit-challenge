import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLocation } from "wouter";
import {
  addDays,
  formatDateInContext,
  formatMonthLabel,
  formatRelativeDate,
  getMonthKey,
  getWeekStart,
  shiftMonth,
  parseDateKey,
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
  getWeeklyWeights,
  getWeekWindow,
  getWeightSummary,
  getWindowLastWeek,
  WEEKS_PER_WINDOW,
  withChangeFromPrevious,
} from "../../lib/stats";
import { SegmentedControl, useToast } from "../ui";
import { WeightEntryForm } from "../weight-entry-form";
import { WeightEntrySheet } from "../weight-entry-sheet";
import { WeightJournal } from "../weight-journal";
import { WeightWeeks } from "../weight-weeks";
import { WeightWeekDetail } from "../weight-week-detail";
import { appHref, useAppSearch, getAppPath, rememberView, useRestoreView } from "../../lib/navigation";
import { weightScreenClasses } from "./weight-screen.styles";
import type { TWeightSheetState, TWeightView } from "./weight-screen.types";
import { PeriodPager, type IPeriodPagerControls, type TPeriodOffset } from "../period-pager";
import { WeightPeriodPanel } from "../weight-period-panel";
import { useSavedEntry } from "../../lib/motion";

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
  const search = useAppSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const rawView = params.get("view");
  const view: TWeightView = rawView === "weeks" || rawView === "all" || rawView === "week" ? rawView : "month";
  const rawMonth = params.get("month");
  const monthKey = rawMonth && parseDateKey(`${rawMonth}-01`) && rawMonth <= getMonthKey(todayKey) ? rawMonth : getMonthKey(todayKey);
  const readWeek = (value: string | null, window = false) => {
    try {
      if (value && parseDateKey(value) && value <= todayKey) {
        const week = getWeekStart(value);
        if (window) getWeekWindow(week);
        return week;
      }
    } catch {
      return getWeekStart(todayKey);
    }
    return getWeekStart(todayKey);
  };
  const detailWeek = readWeek(params.get("week"));
  const lastWeek = readWeek(params.get("end") ?? (view === "week" ? getWindowLastWeek(detailWeek, todayKey) : null), true);
  const updateParams = (changes: Record<string, string | null>) => {
    const next = Object.fromEntries(params);
    navigate(appHref("/weight", { ...next, ...changes }), { replace: true });
  };
  const setView = (next: TWeightView) => updateParams({ view: next, week: null });
  const setMonthKey = (next: string) => updateParams({ month: next });
  const setLastWeek = (next: string) => updateParams({ end: next });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [sheet, setSheet] = useState<TWeightSheetState>(null);
  const [savedEntry, markSaved] = useSavedEntry();
  useRestoreView(getAppPath(), Boolean(entries && settings), view === "week" ? "weight-week" : "weight-overview");

  if (!entries || !settings) {
    return null;
  }

  const formatDate = (dateKey: string) => formatDateInContext(dateKey, todayKey);

  const showSaved = (saved: TWeightEntry) => {
    markSaved(saved.id);
    setSelectedDate(saved.date);
    setSelectedWeek(getWeekStart(saved.date));
    updateParams({ month: getMonthKey(saved.date), end: getWindowLastWeek(saved.date, todayKey), ...(view === "week" ? { week: getWeekStart(saved.date) } : {}) });
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
  if (view === "week") {
    return <>
      <WeightWeekDetail savedEntry={savedEntry} weekStart={detailWeek} entries={entries} todayKey={todayKey} goalWeightKg={settings.goalWeightKg} selectedDate={selectedDate} onSelect={setSelectedDate} onEdit={(entry) => setSheet({ mode: "edit", entry })} onPrevious={() => updateParams({ week: addDays(detailWeek, -7) })} onNext={() => updateParams({ week: addDays(detailWeek, 7) })} canPrevious={detailWeek > firstWeek} canNext={detailWeek < currentWeek} backHref={appHref("/weight", { ...Object.fromEntries(params), view: "weeks", week: null, end: lastWeek })} />
      <button type="button" className={weightScreenClasses.fab} aria-label="Log weight" onClick={() => setSheet({ mode: "new" })}><svg viewBox="0 0 22 22" aria-hidden="true" className={weightScreenClasses.fabIcon}><path d="M11 4v14M4 11h14" /></svg></button>
      {entrySheet}
    </>;
  }
  const rows = withChangeFromPrevious(entries);
  const weekWindow = getWeekWindow(lastWeek);
  const visibleWeeks = getWeeklyWeights(entries).filter(
    (week) => week.weekStart >= weekWindow.start && week.weekStart <= weekWindow.end,
  );
  const visibleEntries = view === "month" ? getEntriesInMonth(entries, monthKey) : entries;
  const periodSummary = getWeightSummary(visibleEntries, null);
  const canPrevious = view === "month" ? monthKey > firstMonthKey : view === "weeks" && weekWindow.start > firstWeek;
  const canNext = view === "month" ? monthKey < currentMonthKey : view === "weeks" && lastWeek < currentWeek;
  const previous = () => view === "month" ? setMonthKey(shiftMonth(monthKey, -1)) : setLastWeek(addDays(lastWeek, -WEEKS_PER_WINDOW * 7));
  const next = () => view === "month" ? setMonthKey(shiftMonth(monthKey, 1)) : setLastWeek(addDays(lastWeek, WEEKS_PER_WINDOW * 7));
  const renderPanel = (offset: TPeriodOffset, controls: IPeriodPagerControls) => (
    <WeightPeriodPanel view={view} period={view === "month" ? shiftMonth(monthKey, offset) : addDays(lastWeek, offset * WEEKS_PER_WINDOW * 7)} entries={entries} todayKey={todayKey} goalWeightKg={settings.goalWeightKg} selectedDate={selectedDate} selectedWeek={selectedWeek} onSelectDate={setSelectedDate} onSelectWeek={setSelectedWeek} onEdit={(entry) => setSheet({ mode: "edit", entry })} canPrevious={canPrevious} canNext={canNext} onPrevious={controls.onPrevious} onNext={controls.onNext} />
  );

  return (
    <section className={weightScreenClasses.screen}>
      <div role="region" aria-label="Overall weight">
        <p className={weightScreenClasses.overallLabel}>Overall</p>
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
      </div>
      <SegmentedControl label="Chart range" options={VIEWS.map(({ view: value, label }) => ({ value, label }))} value={view} onChange={setView} className={weightScreenClasses.viewSwitch} />

      {view === "all" ? renderPanel(0, { onPrevious: previous, onNext: next }) : (
        <PeriodPager key={view} periodKey={`${view}-${view === "month" ? monthKey : lastWeek}`} canPrevious={canPrevious} canNext={canNext} onPrevious={previous} onNext={next} renderPage={renderPanel} />
      )}

      {view === "month" && periodSummary.first && periodSummary.latest ? (
        <dl className={weightScreenClasses.periodStats} aria-label="Month comparison">
          <div className={weightScreenClasses.stat}>
            <dt className={weightScreenClasses.statLabel}>First recorded</dt>
            <dd className={weightScreenClasses.statValue}>{formatKg(periodSummary.first.weightKg)}<span className={weightScreenClasses.statNote}>{formatDate(periodSummary.first.date)}</span></dd>
          </div>
          <div className={weightScreenClasses.stat}>
            <dt className={weightScreenClasses.statLabel}>{view === "month" && monthKey < currentMonthKey ? "Last recorded" : "Latest recorded"}</dt>
            <dd className={weightScreenClasses.statValue}>{formatKg(periodSummary.latest.weightKg)}<span className={weightScreenClasses.statNote}>{formatDate(periodSummary.latest.date)}</span></dd>
          </div>
          <div className={weightScreenClasses.stat}>
            <dt className={weightScreenClasses.statLabel}>Change</dt>
            <dd className={weightScreenClasses.statValue}>{periodSummary.changeSinceFirstKg === null ? "—" : `${formatSignedWeightValue(periodSummary.changeSinceFirstKg)} kg`}</dd>
          </div>
        </dl>
      ) : null}

      {view === "weeks" ? (
        <WeightWeeks weeks={visibleWeeks} todayKey={todayKey} getWeekHref={(weekStart) => appHref("/weight", { ...Object.fromEntries(params), view: "week", week: weekStart, end: lastWeek })} onOpen={() => rememberView(appHref("/weight", { ...Object.fromEntries(params), view: "weeks", week: null, end: lastWeek }))} />
      ) : (
        <WeightJournal
          key={`${view}-${monthKey}`}
          savedEntry={savedEntry}
          expanded={params.get("journal") === (view === "all" ? "all" : monthKey)}
          onExpandedChange={(expanded) => updateParams({ journal: expanded ? (view === "all" ? "all" : monthKey) : null })}
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
