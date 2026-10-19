import { useId, useState } from "react";
import type { FormEvent } from "react";
import { formatDateInContext } from "../../lib/dates";
import { isRepositoryError, saveWeightEntry } from "../../lib/db";
import { formatKg, formatWeightValue, parseDecimal } from "../../lib/numbers";
import { Button, Field } from "../ui";
import { weightEntryFormClasses } from "./weight-entry-form.styles";
import type { IWeightEntryFormProps } from "./weight-entry-form.types";

export function WeightEntryForm({
  entry,
  entries,
  todayKey,
  lead,
  submitLabel,
  autoFocus = false,
  onSaved,
  onDelete,
}: IWeightEntryFormProps) {
  const weightId = useId();
  const errorId = useId();
  const [date, setDate] = useState(entry?.date ?? todayKey);
  const [weightText, setWeightText] = useState(entry ? formatWeightValue(entry.weightKg) : "");
  const [note, setNote] = useState(entry?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const occupant = entries.find((item) => item.date === date && item.id !== entry?.id);
  const placeholder = entries.length
    ? formatWeightValue(entries[entries.length - 1].weightKg)
    : "00.0";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!date || date > todayKey) {
      setError("Pick today or an earlier date.");
      return;
    }

    const weightKg = parseDecimal(weightText);
    if (weightKg === null || weightKg <= 0) {
      setError("Enter your weight, for example 83.4.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = await saveWeightEntry({ date, weightKg, note }, entry?.id);
      onSaved(saved);
    } catch (saveError) {
      setError(
        isRepositoryError(saveError)
          ? saveError.message
          : "Could not save. Nothing was changed.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsSaving(true);
    setError(null);

    try {
      await onDelete();
    } catch {
      setError("Could not delete. Nothing was changed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={weightEntryFormClasses.form} onSubmit={handleSubmit} noValidate>
      <div className={weightEntryFormClasses.sentence}>
        {lead ? <span aria-hidden="true">{lead} </span> : null}
        <label htmlFor={weightId} className={weightEntryFormClasses.srOnly}>
          Weight in kg
        </label>
        <input
          id={weightId}
          className={weightEntryFormClasses.weightInput}
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={weightText}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => setWeightText(event.target.value)}
        />
        <span aria-hidden="true"> kg</span>
      </div>

      <Field
        label="Date"
        type="date"
        value={date}
        max={todayKey}
        required
        onChange={(event) => setDate(event.target.value)}
        hint={
          occupant
            ? `Replaces the entry for ${formatDateInContext(occupant.date, todayKey)} (${formatKg(occupant.weightKg)}).`
            : "One entry per day."
        }
      />

      <Field
        label="Note, optional"
        value={note}
        placeholder="Before breakfast"
        maxLength={140}
        onChange={(event) => setNote(event.target.value)}
      />

      {error ? (
        <p id={errorId} role="alert" className={weightEntryFormClasses.error}>
          {error}
        </p>
      ) : null}

      <div className={weightEntryFormClasses.actions}>
        <Button type="submit" disabled={isSaving}>
          {submitLabel}
        </Button>
        {onDelete ? (
          <Button variant="quiet" onClick={handleDelete} disabled={isSaving}>
            Delete entry
          </Button>
        ) : null}
      </div>
    </form>
  );
}
