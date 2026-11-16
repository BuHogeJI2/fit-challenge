import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { formatDateInContext } from "../../lib/dates";
import { addSet, isRepositoryError, listTrainings, updateSet, type TExercise, type TSet, type TTrainingTarget } from "../../lib/db";
import { formatLoadValue, parseDecimal } from "../../lib/numbers";
import { formatSetValues, getEntryNoun, getLatestSet, getTrainingTitle } from "../../lib/stats";
import { Button, Field, Sheet } from "../ui";
import { setEntrySheetClasses } from "./set-entry-sheet.styles";
import type {
  ISetEntryFormProps,
  ISetEntryBodyProps,
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

function SetEntryForm({ exercise, set, sets, todayKey, date, onDateChange, trainings, exercises, target, onTargetChange, fixedTraining, values, onSaved, onDelete }: ISetEntryFormProps) {
  const repsId = useId();
  const loadId = useId();
  const timeId = useId();
  const secondsId = useId();
  const lastSet = set ?? getLatestSet(sets.filter((item) => item.exerciseId === exercise.id));
  const initial = set ?? values ?? lastSet;
  const isSession = exercise.metric === "session";
  const noun = getEntryNoun(exercise.metric);

  const [repsText, setRepsText] = useState(initial?.reps?.toString() ?? "");
  const [loadText, setLoadText] = useState(
    initial?.weightKg != null ? formatLoadValue(initial.weightKg) : "",
  );
  const [minutesText, setMinutesText] = useState(
    initial?.seconds != null ? String(Math.floor(initial.seconds / 60)) : "",
  );
  const [secondsText, setSecondsText] = useState(
    initial?.seconds != null ? String(initial.seconds % 60).padStart(2, "0") : "",
  );
  const [note, setNote] = useState(set?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dayTrainings = trainings.filter((training) => training.date === date);
  const resolvedTarget = target ?? (dayTrainings.length === 1
    ? { trainingId: dayTrainings[0].id }
    : dayTrainings.length === 0 ? { newTraining: true as const } : undefined);

  const readValues = (): TReadResult => {
    if (isSession) {
      return { ok: true, values: { reps: null, weightKg: null, seconds: null } };
    }

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

    if (!resolvedTarget) {
      setError("Choose a training or start a new one.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const saved = set
        ? await updateSet(set.id, { date, note, target: resolvedTarget, ...result.values })
        : await addSet({ exerciseId: exercise.id, date, note, target: resolvedTarget, ...result.values });
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
        {isSession ? (
          <span>{exercise.name}</span>
        ) : (
          <span aria-hidden="true">{exercise.name}: </span>
        )}
        {isSession ? null : exercise.metric === "time" ? (
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

      {exercise.metric === "reps" || exercise.metric === "reps_weight" ? (
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
          {isSession ? (
            <>Last session: {formatDateInContext(lastSet.date, todayKey)}</>
          ) : (
            <>
              Last set: {formatDateInContext(lastSet.date, todayKey)} ·{" "}
              {formatSetValues(exercise.metric, lastSet)}
            </>
          )}
        </p>
      ) : null}

      <Field
        label="Date"
        type="date"
        value={date}
        max={todayKey}
        required
        disabled={fixedTraining}
        onChange={(event) => onDateChange(event.target.value)}
      />

      <fieldset className={setEntrySheetClasses.trainingPicker}>
        <legend className={setEntrySheetClasses.trainingLabel}>{set ? "Move to training" : "Training"}</legend>
        {dayTrainings.length ? (
          <div className={setEntrySheetClasses.trainingOptions}>
            {dayTrainings.map((training) => {
              const title = getTrainingTitle(training, sets, exercises);
              const matching = dayTrainings.filter((item) => getTrainingTitle(item, sets, exercises) === title);
              const ordinal = matching.findIndex((item) => item.id === training.id) + 1;
              const isSelected = Boolean(resolvedTarget && "trainingId" in resolvedTarget && resolvedTarget.trainingId === training.id);
              return (
                <button
                  key={training.id}
                  type="button"
                  disabled={fixedTraining}
                  aria-pressed={isSelected}
                  className={isSelected ? setEntrySheetClasses.chipActive : setEntrySheetClasses.chip}
                  onClick={() => onTargetChange({ trainingId: training.id })}
                >
                  {title}{matching.length > 1 ? ` · ${ordinal}` : ""}
                </button>
              );
            })}
            {!fixedTraining ? (
              <button type="button" className={resolvedTarget && "newTraining" in resolvedTarget ? setEntrySheetClasses.chipActive : setEntrySheetClasses.chip} aria-pressed={Boolean(resolvedTarget && "newTraining" in resolvedTarget)} onClick={() => onTargetChange({ newTraining: true })}>
                New training
              </button>
            ) : null}
          </div>
        ) : <p className={setEntrySheetClasses.hint}>Starts a new training on this date.</p>}
      </fieldset>

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
          {set ? "Save" : `Log ${noun}`}
        </Button>
        {set && onDelete ? (
          <Button variant="quiet" onClick={handleDelete} disabled={isSaving}>
            Delete {noun}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function SetEntryBody({
  state,
  exercises,
  sets,
  todayKey,
  trainings,
  onExerciseChange,
  exercise,
  recentExercises,
  onSaved,
  onDelete,
}: ISetEntryBodyProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerContents = JSON.stringify(recentExercises.map(({ id, name }) => [id, name]));
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;
    const update = () => {
      picker.dataset.overflowLeft = String(picker.scrollLeft > 1);
      picker.dataset.overflowRight = String(picker.scrollLeft + picker.clientWidth < picker.scrollWidth - 1);
    };
    update();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    observer?.observe(picker);
    picker.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      picker.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pickerContents]);
  const editedSet: TSet | null = state?.mode === "edit" ? state.set : null;
  const fixedTrainingId = state?.mode === "new" ? state.trainingId : undefined;
  const fixedTraining = trainings.find((training) => training.id === fixedTrainingId);
  const [date, setDate] = useState(editedSet?.date ?? fixedTraining?.date ?? (state?.mode === "new" ? state.date : undefined) ?? todayKey);
  const [target, setTarget] = useState<TTrainingTarget | undefined>(
    fixedTrainingId || editedSet ? { trainingId: fixedTrainingId ?? editedSet!.trainingId } : undefined,
  );

  const fixedId = editedSet?.exerciseId ?? (state?.mode === "new" ? state.exerciseId : undefined);

  return (
    <>
      {!fixedId && recentExercises.length > 1 ? (
        <div ref={pickerRef} className={setEntrySheetClasses.exercisePicker} role="group" aria-label="Exercise">
          {recentExercises.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === exercise?.id}
              className={
                item.id === exercise?.id
                  ? setEntrySheetClasses.chipActive
                  : setEntrySheetClasses.chip
              }
              onClick={() => onExerciseChange(item.id)}
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
          date={date}
          onDateChange={(nextDate) => {
            setDate(nextDate);
            setTarget(editedSet?.date === nextDate ? { trainingId: editedSet.trainingId } : undefined);
          }}
          trainings={trainings}
          exercises={exercises}
          target={target}
          onTargetChange={setTarget}
          fixedTraining={Boolean(fixedTrainingId)}
          values={state?.mode === "new" ? state.values : undefined}
          onSaved={onSaved}
          onDelete={onDelete}
        />
      ) : (
        <p className={setEntrySheetClasses.hint}>Add an exercise first.</p>
      )}
    </>
  );
}

export function SetEntrySheet(props: ISetEntrySheetProps) {
  const trainings = useLiveQuery(listTrainings, []);
  const [pickedExerciseId, setPickedExerciseId] = useState<string | null>(null);
  const fixedExerciseId = props.state?.mode === "edit" ? props.state.set.exerciseId : props.state?.exerciseId;
  const recentExercises = props.exercises.filter((item) => !item.archivedAt).sort((left, right) => {
    const latest = (item: TExercise) => {
      const last = getLatestSet(props.sets.filter((set) => set.exerciseId === item.id));
      return last ? `${last.date}${last.createdAt}` : item.createdAt;
    };
    return latest(right).localeCompare(latest(left));
  });
  const exercise = props.exercises.find((item) => item.id === (fixedExerciseId ?? pickedExerciseId)) ?? recentExercises[0];
  const noun = exercise ? getEntryNoun(exercise.metric) : "set";
  return (
    <Sheet open={props.state !== null} title={`${props.state?.mode === "edit" ? "Edit" : "Log"} ${noun}`} onClose={() => { setPickedExerciseId(null); props.onClose(); }}>
      {props.state && trainings ? <SetEntryBody {...props} trainings={trainings} exercise={exercise} recentExercises={recentExercises} onExerciseChange={setPickedExerciseId} onSaved={(saved) => { setPickedExerciseId(null); props.onSaved(saved); }} /> : null}
    </Sheet>
  );
}
