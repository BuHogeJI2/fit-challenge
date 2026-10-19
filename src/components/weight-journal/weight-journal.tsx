import { formatDateInContext, formatDayOfMonth, formatWeekdayShort } from "../../lib/dates";
import { formatSignedWeightValue, formatWeightValue } from "../../lib/numbers";
import { weightJournalClasses } from "./weight-journal.styles";
import type { IWeightJournalProps } from "./weight-journal.types";

export function WeightJournal({ rows, showMonth, todayKey, onEdit }: IWeightJournalProps) {
  if (!rows.length) {
    return null;
  }

  return (
    <ol className={weightJournalClasses.list} aria-label="Weigh-ins">
      {rows.map(({ entry, changeKg }) => (
        <li key={entry.id} className={weightJournalClasses.item}>
          <button
            type="button"
            className={weightJournalClasses.row}
            aria-label={`Edit ${formatDateInContext(entry.date, todayKey)}, ${formatWeightValue(entry.weightKg)} kg`}
            onClick={() => onEdit(entry)}
          >
            <span className={weightJournalClasses.date}>
              <span className={weightJournalClasses.day}>
                {showMonth ? formatDateInContext(entry.date, todayKey) : formatDayOfMonth(entry.date)}
              </span>
              <span className={weightJournalClasses.weekday}>
                {formatWeekdayShort(entry.date)}
              </span>
            </span>
            <span className={weightJournalClasses.note}>{entry.note}</span>
            <span className={weightJournalClasses.values}>
              <span className={weightJournalClasses.value}>
                {formatWeightValue(entry.weightKg)}
              </span>
              <span className={weightJournalClasses.change}>
                {changeKg === null ? "first" : formatSignedWeightValue(changeKg)}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
