import { useId, useState } from "react";
import { formatDateInContext, formatDayOfMonth, formatWeekdayShort } from "../../lib/dates";
import { formatSignedWeightValue, formatWeightValue } from "../../lib/numbers";
import { weightJournalClasses } from "./weight-journal.styles";
import type { IWeightJournalProps } from "./weight-journal.types";

export function WeightJournal({ rows, showMonth, todayKey, onEdit, previewCount = 3 }: IWeightJournalProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  if (!rows.length) {
    return null;
  }

  return (
    <>
    <h2 className={weightJournalClasses.heading}>{rows.length > previewCount && !expanded ? "Recent weigh-ins" : "Weigh-ins"}</h2>
    <ol id={listId} className={weightJournalClasses.list} aria-label="Weigh-ins">
      {(expanded ? rows : rows.slice(0, previewCount)).map(({ entry, changeKg }) => (
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
    {rows.length > previewCount ? <button type="button" aria-controls={listId} aria-expanded={expanded} className={weightJournalClasses.disclosure} onClick={() => setExpanded(!expanded)}>
      {expanded ? "Show fewer" : `Show all ${rows.length} weigh-ins`}
    </button> : null}
    </>
  );
}
