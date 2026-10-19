import { useId, useState } from "react";
import type { FormEvent } from "react";
import { formatDateInContext } from "../../lib/dates";
import { addSet, isRepositoryError, updateSet, type TExercise, type TSet } from "../../lib/db";
import { formatLoadValue, parseDecimal } from "../../lib/numbers";
import { formatSetValues, getLatestSet } from "../../lib/stats";
import { Button, Field, Sheet } from "../ui";
import { setEntrySheetClasses } from "./set-entry-sheet.styles";
import type {
  ISetEntryFormProps,
  ISetEntrySheetProps,
  TReadResult,
} from "./set-entry-sheet.types";

const QUICK_PICK_SPREAD = 2;
const DEFAULT_QUICK_PICKS = [5, 10, 15, 20, 25];

const getQuickPicks = (lastReps: number | null) =>
  lastReps === null
    ? DEFAULT_QUICK_PICKS
    : Array.from({ length: QUICK_PICK_SPREAD * 2 + 1 }, (_, index) => lastReps - QUICK_PICK_SPREAD + index).filter(
        (value) => value > 0,
      );

const parseCount = (text: string) => {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) && Number.isSafeInteger(Number(trimmed)) ? Number(trimmed) : null;
};

const parseWholeNumber = (text: string) => {
  const value = parseCount(text);
  return value !== null && value > 0 ? value : null;
};

function SetEntryForm({ exercise, set, sets, todayKey, onSaved, onDelete }: ISetEntryFormProps) {
  const repsId = useId();
  const loadId = useId();
  const timeId = useId();
  const secondsId = useId();
  const lastSet = set ?? getLatestSet(sets.filter((item) => item.exerciseId === exercise.id));

  const [date, setDate] = useState(set?.date ?? todayKey);
  const [repsText, setRepsText] = useState(lastSet?.reps?.toString() ?? "");
  const [loadText, setLoadText] = useState(
    lastSet?.weightKg != null ? formatLoadValue(lastSet.weightKg) : "",
  );
  const [minutesText, setMinutesText] = useState(
    lastSet?.seconds != null ? String(Math.floor(lastSet.seconds / 60)) : "",
  );
  const [secondsText, setSecondsText] = useState(
    lastSet?.seconds != null ? String(lastSet.seconds % 60).padStart(2, "0") : "",
  );
  const [note, setNote] = useState(set?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const readValues = (): TReadResult => {
    if (exercise.metric === "time") {
      const minutes = minutesText.trim() ? parseCount(minutesText) : 0;
      const seconds = secondsText.trim() ? parseCount(secondsText) : 0;
      const total = minutes === null || seconds === null || seconds > 59 ? null : minutes * 60 + seconds;
      if (total === null || total <= 0 || !Number.isSafeInteger(total)) {
        return { ok: false, error: "Enter the time in minutes and seconds (0 to 59), for example 1 min 45 s." };
      }
      return { ok: true, values: { reps: null, weightKg: null, seconds: total } };
    }

    const reps = parseWholeNumber(repsText);
    if (reps === null) {
      return { ok: false, error: "Enter the reps as a whole number." };
    }

    if (exercise.metric === "reps") {
      return { ok: true, values: { reps, weightKg: null, seconds: null } };
    }

    const weightKg = parseDecimal(loadText);
    if (weightKg === null || weightKg <= 0) {
      return { ok: false, error: "Enter the weight in kg, for example 24." };
    }
    return { ok: true, values: { reps, weightKg, seconds: null } };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!date || date > todayKey) {
      setError("Pick today or an earlier date.");
      return;
    }

    const result = readValues();
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const saved = set
        ? await updateSet(set.id, { date, note, ...result.values })
        : await addSet({ exerciseId: exercise.id, date, note, ...result.values });
      onSaved(saved);
    } catch (saveError) {
      setError(
        isRepositoryError(saveError) ? saveError.message : "Could not save. Nothing was changed.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!set || !onDelete) return;

    setIsSaving(true);
    setError(null);
    try {
      await onDelete(set);
    } catch {
      setError("Could not delete. Nothing was changed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={setEntrySheetClasses.form} onSubmit={handleSubmit} noValidate>
      <div className={setEntrySheetClasses.sentence}>
        <span aria-hidden="true">{exercise.name}: </span>
        {exercise.metric === "time" ? (
          <>
            <label htmlFor={timeId} className={setEntrySheetClasses.srOnly}>
              Minutes
            </label>
            <input
              id={timeId}
              className={setEntrySheetClasses.input}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={minutesText}
              onChange={(event) => setMinutesText(event.target.value)}
            />
            <span aria-hidden="true"> min </span>
            <label htmlFor={secondsId} className={setEntrySheetClasses.srOnly}>
              Seconds
            </label>
            <input
              id={secondsId}
              className={setEntrySheetClasses.input}
              inputMode="numeric"
              autoComplete="off"
              placeholder="00"
              value={secondsText}
              onChange={(event) => setSecondsText(event.target.value)}
            />
            <span aria-hidden="true"> s</span>
          </>
        ) : (
          <>
            <label htmlFor={repsId} className={setEntrySheetClasses.srOnly}>
              Reps
            </label>
            <input
              id={repsId}
              className={setEntrySheetClasses.input}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={repsText}
              onChange={(event) => setRepsText(event.target.value)}
            />
            <span aria-hidden="true"> reps</span>
            {exercise.metric === "reps_weight" ? (
              <>
                <span aria-hidden="true"> at </span>
                <label htmlFor={loadId} className={setEntrySheetClasses.srOnly}>
                  Weight in kg
                </label>
                <input
                  id={loadId}
                  className={setEntrySheetClasses.input}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={loadText}
                  onChange={(event) => setLoadText(event.target.value)}
                />
                <span aria-hidden="true"> kg</span>
              </>
            ) : null}
          </>
        )}
      </div>

      {exercise.metric !== "time" ? (
        <div className={setEntrySheetClasses.picks} role="group" aria-label="Quick reps">
          {getQuickPicks(lastSet?.reps ?? null).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={repsText === String(value)}
              className={
                repsText === String(value)
                  ? setEntrySheetClasses.pickActive
                  : setEntrySheetClasses.pick
              }
              onClick={() => setRepsText(String(value))}
            >
              {value}
            </button>
          ))}
        </div>
      ) : null}

      {lastSet && !set ? (
        <p className={setEntrySheetClasses.hint}>
          Last set: {formatDateInContext(lastSet.date, todayKey)} ·{" "}
          {formatSetValues(exercise.metric, lastSet)}
        </p>
      ) : null}

      <Field
        label="Date"
        type="date"
        value={date}
        max={todayKey}
        required
        onChange={(event) => setDate(event.target.value)}
      />

      <Field
        label="Note, optional"
        value={note}
        placeholder="How did it feel?"
        maxLength={140}
        onChange={(event) => setNote(event.target.value)}
      />

      {error ? (
        <p role="alert" className={setEntrySheetClasses.error}>
          {error}
        </p>
      ) : null}

      <div className={setEntrySheetClasses.actions}>
        <Button type="submit" disabled={isSaving}>
          {set ? "Save" : "Log set"}
        </Button>
        {set && onDelete ? (
          <Button variant="quiet" onClick={handleDelete} disabled={isSaving}>
            Delete set
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function SetEntrySheet({
  state,
  exercises,
  sets,
  todayKey,
  onClose,
  onSaved,
  onDelete,
}: ISetEntrySheetProps) {
  const editedSet: TSet | null = state?.mode === "edit" ? state.set : null;
  const [pickedId, setPickedId] = useState<string | null>(null);

  const fixedId = editedSet?.exerciseId ?? (state?.mode === "new" ? state.exerciseId : undefined);
  const activeExercises = exercises.filter((exercise) => !exercise.archivedAt);
  const lastActivity = (exercise: TExercise) => {
    const last = getLatestSet(sets.filter((set) => set.exerciseId === exercise.id));
    return last ? `${last.date}${last.createdAt}` : exercise.createdAt;
  };
  const recentFirst = [...activeExercises].sort((left, right) =>
    lastActivity(right).localeCompare(lastActivity(left)),
  );
  const exercise: TExercise | undefined = fixedId
    ? exercises.find((item) => item.id === fixedId)
    : (recentFirst.find((item) => item.id === pickedId) ?? recentFirst[0]);

  const handleClose = () => {
    setPickedId(null);
    onClose();
  };

  return (
    <Sheet open={state !== null} title={editedSet ? "Edit set" : "Log set"} onClose={handleClose}>
      {!fixedId && recentFirst.length > 1 ? (
        <div className={setEntrySheetClasses.exercisePicker} role="group" aria-label="Exercise">
          {recentFirst.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === exercise?.id}
              className={
                item.id === exercise?.id
                  ? setEntrySheetClasses.chipActive
                  : setEntrySheetClasses.chip
              }
              onClick={() => setPickedId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}
      {exercise ? (
        <SetEntryForm
          key={`${exercise.id}-${editedSet?.id ?? "new"}`}
          exercise={exercise}
          set={editedSet}
          sets={sets}
          todayKey={todayKey}
          onSaved={(saved) => {
            setPickedId(null);
            onSaved(saved);
          }}
          onDelete={onDelete}
        />
      ) : (
        <p className={setEntrySheetClasses.hint}>Add an exercise first.</p>
      )}
    </Sheet>
  );
}
