import { addDays, formatDateInContext, formatDateRange, formatMonthLabel, getMonthRange, getWeekStart } from "../../lib/dates";
import { formatKg, formatWeightValue } from "../../lib/numbers";
import { getEntriesInMonth, getMonthWeightSummary, getWeeklyWeights, getWeekWindow, WEEKS_PER_WINDOW } from "../../lib/stats";
import { LineChart } from "../charts";
import { Button } from "../ui";
import { getMonthAxisLabels, getRangeAxisLabels, getWeekAxisLabels, getWeekMiddle } from "../charts/axis-labels";
import { weightPanelClasses as classes } from "./weight-period-panel.styles";
import type { IWeightPeriodPanelProps } from "./weight-period-panel.types";

export function WeightPeriodPanel({ view, period, entries, todayKey, goalWeightKg, selectedDate, selectedWeek, onSelectDate, onSelectWeek, onEdit, canPrevious, canNext, onPrevious, onNext }: IWeightPeriodPanelProps) {
  const isWeeks = view === "weeks";
  const isWeek = view === "week";
  const domain = view === "month" ? getMonthRange(period)
    : isWeeks ? getWeekWindow(period)
      : isWeek ? { start: period, end: addDays(period, 6) }
        : { start: entries[0].date, end: entries[entries.length - 1].date };
  const visible = view === "month" ? getEntriesInMonth(entries, period)
    : view === "all" ? entries
      : entries.filter((entry) => entry.date >= domain.start && entry.date <= domain.end);
  const weeks = getWeeklyWeights(entries).filter((week) => week.weekStart >= domain.start && week.weekStart <= domain.end);
  const selected = visible.find((entry) => entry.date === selectedDate) ?? visible.at(-1) ?? null;
  const selectedAverage = weeks.find((week) => week.weekStart === selectedWeek) ?? weeks.at(-1) ?? null;
  const formatDate = (date: string) => formatDateInContext(date, todayKey);
  const formatWeek = (date: string) => formatDateRange(date, addDays(date, 6), todayKey);
  const title = view === "month" ? formatMonthLabel(period, todayKey) : isWeeks ? formatDateRange(domain.start, domain.end, todayKey) : isWeek ? formatWeek(period) : "All time";
  const previousLabel = view === "month" ? "Previous month" : isWeeks ? `Previous ${WEEKS_PER_WINDOW} weeks` : "Previous weight week";
  const nextLabel = view === "month" ? "Next month" : isWeeks ? `Next ${WEEKS_PER_WINDOW} weeks` : "Next weight week";
  const count = `${visible.length} weigh-in${visible.length === 1 ? "" : "s"}`;
  const month = view === "month" ? getMonthWeightSummary(entries, period) : null;
  const meta = month ? month.count
    ? `${count} · average ${formatWeightValue(month.averageKg!)} · range ${formatWeightValue(month.minKg!)}–${formatWeightValue(month.maxKg!)}`
    : "No weigh-ins this month"
    : isWeeks ? visible.length ? count : "No weigh-ins in these weeks"
      : isWeek ? `${count}${weeks[0] ? ` · average ${formatKg(weeks[0].averageKg)}` : ""}`
        : `${count} since ${formatDate(entries[0].date)}`;
  const points = isWeeks ? weeks.map((week) => ({ date: getWeekMiddle(week.weekStart), value: week.averageKg }))
    : visible.map((entry) => ({ date: entry.date, value: entry.weightKg }));
  const readout = isWeeks ? selectedAverage ? `${formatWeek(selectedAverage.weekStart)} · avg ${formatKg(selectedAverage.averageKg)}` : null
    : selected ? `${formatDate(selected.date)} · ${formatKg(selected.weightKg)}` : null;
  const xLabels = view === "month" ? getMonthAxisLabels(period)
    : isWeeks ? getWeekAxisLabels(Array.from({ length: WEEKS_PER_WINDOW }, (_, index) => addDays(domain.start, index * 7)))
      : getRangeAxisLabels(domain.start, domain.end);
  const chartLabel = isWeeks ? `Weekly average weight chart, ${weeks.length} weeks`
    : isWeek ? `Daily weight for ${formatWeek(period)}`
      : `Weight chart, ${visible.length} weigh-ins from ${visible[0] ? formatDate(visible[0].date) : ""} to ${selected ? formatDate(visible.at(-1)!.date) : ""}`;

  return <div className={classes.panel}>
    <div className={classes.header}>
      <h1 className={classes.title}>{title}</h1>
      {view !== "all" ? <div className={classes.arrows}>
        <button type="button" className={classes.arrow} aria-label={previousLabel} disabled={!canPrevious} onClick={onPrevious}>‹</button>
        <button type="button" className={classes.arrow} aria-label={nextLabel} disabled={!canNext} onClick={onNext}>›</button>
      </div> : null}
    </div>
    <p className={classes.meta}>{meta}{isWeek && goalWeightKg !== null ? ` · goal ${formatKg(goalWeightKg)}` : ""}</p>
    {points.length ? <div className={classes.chart}>
      {isWeeks ? <p className={classes.legend}>
        <span className={classes.legendItem}><span className={classes.averageMark} aria-hidden="true" />Weekly average</span>
        <span className={classes.legendItem}><span className={classes.entryMark} aria-hidden="true" />Weigh-ins</span>
      </p> : null}
      <div className={classes.readout}>
        <p className={classes.readoutText} aria-live="polite">{readout}</p>
        {!isWeeks && selected ? <Button variant="soft" size="sm" className={classes.edit} aria-label={`Edit weigh-in, ${formatDate(selected.date)}`} onClick={() => onEdit(selected)}>Edit</Button> : null}
      </div>
      <LineChart points={points} backgroundPoints={isWeeks ? visible.map((entry) => ({ date: entry.date, value: entry.weightKg })) : []} startKey={domain.start} endKey={domain.end} xLabels={xLabels} goalValue={goalWeightKg} fitGoal={view === "all"} selectedDate={isWeeks ? selectedAverage ? getWeekMiddle(selectedAverage.weekStart) : null : selected?.date ?? null} onSelect={isWeeks ? (date) => onSelectWeek(getWeekStart(date)) : onSelectDate} formatValue={formatWeightValue} unit="kg" minSpan={1} label={chartLabel} />
      {entries.length === 1 && !isWeek ? <p className={classes.meta}>The line starts with your second weigh-in.</p> : null}
    </div> : <p className={classes.empty}>{isWeeks ? "Nothing logged in these weeks." : isWeek ? "Nothing logged in this week." : "Nothing logged in this month."}</p>}
  </div>;
}
