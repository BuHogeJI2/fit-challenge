import { useState, type FormEvent } from "react";
import { isRepositoryError, TRAINING_NAME_MAX_LENGTH, updateTraining } from "../../lib/db";
import { Button, Field, Sheet } from "../ui";
import type { ITrainingFormSheetProps } from "./training-form-sheet.types";
import { trainingFormSheetClasses as classes } from "./training-form-sheet.styles";

function TrainingForm({ training, todayKey, entryCount, onSaved, onDelete }: ITrainingFormSheetProps) {
  const [name, setName] = useState(training?.name ?? "");
  const [date, setDate] = useState(training?.date ?? todayKey);
  const [note, setNote] = useState(training?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!training) return;
    if (!date || date > todayKey) {
      setError("Pick today or an earlier date.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onSaved(await updateTraining(training.id, { name, date, note }));
    } catch (cause) {
      setError(isRepositoryError(cause) ? cause.message : "Could not save. Nothing was changed.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!training) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete(training);
    } catch {
      setError("Could not delete. Nothing was changed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={classes.form} onSubmit={save} noValidate>
      <Field label="Name, optional" value={name} maxLength={TRAINING_NAME_MAX_LENGTH} placeholder="For example, boxing or evening workout" onChange={(event) => setName(event.target.value)} />
      <Field label="Date" type="date" value={date} max={todayKey} required hint="Changing the date moves every entry in this training." onChange={(event) => setDate(event.target.value)} />
      <Field label="Note, optional" value={note} maxLength={140} onChange={(event) => setNote(event.target.value)} />
      {error ? <p className={classes.error} role="alert">{error}</p> : null}
      <div className={classes.actions}>
        <Button type="submit" disabled={busy}>Save training</Button>
        <Button variant="quiet" disabled={busy} onClick={() => void remove()}>
          Delete training{entryCount ? ` and ${entryCount} entr${entryCount === 1 ? "y" : "ies"}` : ""}
        </Button>
      </div>
    </form>
  );
}

export function TrainingFormSheet(props: ITrainingFormSheetProps) {
  return (
    <Sheet open={props.training !== null} title="Edit training" onClose={props.onClose}>
      {props.training ? <TrainingForm key={props.training.id} {...props} /> : null}
    </Sheet>
  );
}
