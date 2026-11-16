import { Link } from "wouter";
import { addDays, formatDateInContext, formatDateRange } from "../../lib/dates";
import { formatKg, formatSignedWeightValue, formatWeightValue } from "../../lib/numbers";
import { getWeeklyWeights, getWeightSummary, withChangeFromPrevious } from "../../lib/stats";
import { LineChart } from "../charts";
import { getRangeAxisLabels } from "../charts/axis-labels";
import { WeightJournal } from "../weight-journal";
import { weightWeekClasses as classes } from "./weight-week-detail.styles";
import type { IWeightWeekDetailProps } from "./weight-week-detail.types";

export function WeightWeekDetail({ weekStart, entries, todayKey, goalWeightKg, selectedDate, onSelect, onEdit, onPrevious, onNext, canPrevious, canNext, backHref }: IWeightWeekDetailProps) {
  const end = addDays(weekStart, 6);
  const visible = entries.filter((entry) => entry.date >= weekStart && entry.date <= end);
  const summary = getWeightSummary(visible, null);
  const week = getWeeklyWeights(visible)[0];
  const selected = visible.find((entry) => entry.date === selectedDate) ?? visible.at(-1) ?? null;
  const formatDate = (date: string) => formatDateInContext(date, todayKey);
  return <section className={classes.screen}>
    <Link className={classes.back} href={backHref} replace>Back to weeks</Link>
    <div className={classes.period}>
      <button type="button" className={classes.arrow} aria-label="Previous weight week" disabled={!canPrevious} onClick={onPrevious}>‹</button>
      <h1 className={classes.title}>{formatDateRange(weekStart, end, todayKey)}</h1>
      <button type="button" className={classes.arrow} aria-label="Next weight week" disabled={!canNext} onClick={onNext}>›</button>
    </div>
    <p className={classes.subline}>{visible.length} weigh-in{visible.length === 1 ? "" : "s"}{week ? ` · average ${formatKg(week.averageKg)}` : ""}{goalWeightKg !== null ? ` · goal ${formatKg(goalWeightKg)}` : ""}</p>
    {selected ? <div className={classes.chart}>
      <div className={classes.readout}>
        <p className={classes.readoutText} aria-live="polite">{formatDate(selected.date)} · {formatKg(selected.weightKg)}</p>
        <button type="button" className={classes.edit} aria-label={`Edit weigh-in, ${formatDate(selected.date)}`} onClick={() => onEdit(selected)}>Edit entry</button>
      </div>
      <LineChart points={visible.map((entry) => ({ date: entry.date, value: entry.weightKg }))} startKey={weekStart} endKey={end} xLabels={getRangeAxisLabels(weekStart, end)} goalValue={goalWeightKg} selectedDate={selected.date} onSelect={onSelect} formatValue={formatWeightValue} unit="kg" minSpan={1} label={`Daily weight for ${formatDateRange(weekStart, end, todayKey)}`} />
    </div> : <p className={classes.empty}>Nothing logged in this week.</p>}
    {summary.first && summary.latest ? <dl className={classes.summary} aria-label="Week comparison">
      <div><dt className={classes.label}>First recorded</dt><dd className={classes.value}>{formatKg(summary.first.weightKg)}<span className={classes.date}>{formatDate(summary.first.date)}</span></dd></div>
      <div><dt className={classes.label}>Last recorded</dt><dd className={classes.value}>{formatKg(summary.latest.weightKg)}<span className={classes.date}>{formatDate(summary.latest.date)}</span></dd></div>
      <div><dt className={classes.label}>Change</dt><dd className={classes.value}>{summary.changeSinceFirstKg === null ? "—" : `${formatSignedWeightValue(summary.changeSinceFirstKg)} kg`}</dd></div>
    </dl> : null}
    <WeightJournal key={weekStart} rows={withChangeFromPrevious(entries).filter(({ entry }) => entry.date >= weekStart && entry.date <= end)} showMonth todayKey={todayKey} onEdit={onEdit} previewCount={7} />
  </section>;
}
