import { Link } from "wouter";
import { PeriodPager } from "../period-pager";
import { WeightPeriodPanel } from "../weight-period-panel";
import { addDays, formatDateInContext } from "../../lib/dates";
import { formatKg, formatSignedWeightValue } from "../../lib/numbers";
import { getWeightSummary, withChangeFromPrevious } from "../../lib/stats";
import { WeightJournal } from "../weight-journal";
import { weightWeekClasses as classes } from "./weight-week-detail.styles";
import type { IWeightWeekDetailProps } from "./weight-week-detail.types";

export function WeightWeekDetail({ weekStart, entries, todayKey, goalWeightKg, selectedDate, onSelect, onEdit, onPrevious, onNext, canPrevious, canNext, backHref }: IWeightWeekDetailProps) {
  const end = addDays(weekStart, 6);
  const visible = entries.filter((entry) => entry.date >= weekStart && entry.date <= end);
  const summary = getWeightSummary(visible, null);
  const formatDate = (date: string) => formatDateInContext(date, todayKey);
  return <section className={classes.screen}>
    <Link className={classes.back} href={backHref} replace>Back to weeks</Link>
    <PeriodPager periodKey={weekStart} label="week" canPrevious={canPrevious} canNext={canNext} onPrevious={onPrevious} onNext={onNext} renderPage={(offset, controls) => (
      <WeightPeriodPanel view="week" period={addDays(weekStart, offset * 7)} entries={entries} todayKey={todayKey} goalWeightKg={goalWeightKg} selectedDate={selectedDate} selectedWeek={null} onSelectDate={onSelect} onSelectWeek={() => {}} onEdit={onEdit} canPrevious={canPrevious} canNext={canNext} onPrevious={controls.onPrevious} onNext={controls.onNext} />
    )} />
    {summary.first && summary.latest ? <dl className={classes.summary} aria-label="Week comparison">
      <div><dt className={classes.label}>First recorded</dt><dd className={classes.value}>{formatKg(summary.first.weightKg)}<span className={classes.date}>{formatDate(summary.first.date)}</span></dd></div>
      <div><dt className={classes.label}>Last recorded</dt><dd className={classes.value}>{formatKg(summary.latest.weightKg)}<span className={classes.date}>{formatDate(summary.latest.date)}</span></dd></div>
      <div><dt className={classes.label}>Change</dt><dd className={classes.value}>{summary.changeSinceFirstKg === null ? "—" : `${formatSignedWeightValue(summary.changeSinceFirstKg)} kg`}</dd></div>
    </dl> : null}
    <WeightJournal key={weekStart} rows={withChangeFromPrevious(entries).filter(({ entry }) => entry.date >= weekStart && entry.date <= end)} showMonth todayKey={todayKey} onEdit={onEdit} previewCount={7} />
  </section>;
}
