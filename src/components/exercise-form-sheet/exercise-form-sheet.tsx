import { useState } from "react";
import type { FormEvent } from "react";
import {
  EXERCISE_NAME_MAX_LENGTH,
  METRICS,
  createExercise,
  isRepositoryError,
  updateExercise,
  type TMetric,
} from "../../lib/db";
import { Button, Field, Sheet } from "../ui";
import { METRIC_HINTS, METRIC_LABELS } from "./exercise-form-sheet.constants";
import { exerciseFormSheetClasses } from "./exercise-form-sheet.styles";
import type { IExerciseFormProps, IExerciseFormSheetProps } from "./exercise-form-sheet.types";

function ExerciseForm({ exercise, onSaved, onArchiveToggle }: IExerciseFormProps) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [metric, setMetric] = useState<TMetric>(exercise?.metric ?? "reps");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isMetricLocked = Boolean(exercise?.metricLockedAt);

  const run = async (action: () => Promise<void>, fallback: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(isRepositoryError(actionError) ? actionError.message : fallback);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(async () => {
      const saved = exercise
        ? await updateExercise(exercise.id, { name, metric })
        : await createExercise({ name, metric });
      onSaved(saved);
    }, "Could not save. Nothing was changed.");
  };

  return (
    <form className={exerciseFormSheetClasses.form} onSubmit={handleSubmit} noValidate>
      <Field
        label="Name"
        value={name}
        maxLength={EXERCISE_NAME_MAX_LENGTH}
        placeholder="Push-ups"
        autoComplete="off"
        autoFocus={!exercise}
        onChange={(event) => setName(event.target.value)}
      />

      <fieldset className={exerciseFormSheetClasses.fieldset} disabled={isMetricLocked}>
        <legend className={exerciseFormSheetClasses.legend}>What you log</legend>
        {METRICS.map((option) => (
          <label key={option} className={exerciseFormSheetClasses.option}>
            <input
              type="radio"
              name="metric"
              value={option}
              checked={metric === option}
              className={exerciseFormSheetClasses.radio}
              onChange={() => setMetric(option)}
            />
            <span className={exerciseFormSheetClasses.optionText}>
              <span>{METRIC_LABELS[option]}</span>
              <span className={exerciseFormSheetClasses.optionHint}>{METRIC_HINTS[option]}</span>
            </span>
          </label>
        ))}
        {isMetricLocked ? (
          <p className={exerciseFormSheetClasses.hint}>
            This is fixed after the first logged set.
          </p>
        ) : null}
      </fieldset>

      {error ? (
        <p role="alert" className={exerciseFormSheetClasses.error}>
          {error}
        </p>
      ) : null}

      <div className={exerciseFormSheetClasses.actions}>
        <Button type="submit" disabled={isSaving}>
          {exercise ? "Save" : "Add exercise"}
        </Button>
        {exercise ? (
          <Button
            variant="quiet"
            disabled={isSaving}
            onClick={() =>
              void run(
                () => onArchiveToggle(exercise),
                exercise.archivedAt
                  ? "Could not restore. Nothing was changed."
                  : "Could not archive. Nothing was changed.",
              )
            }
          >
            {exercise.archivedAt ? "Restore exercise" : "Archive exercise"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function ExerciseFormSheet({
  open,
  exercise,
  onClose,
  onSaved,
  onArchiveToggle,
}: IExerciseFormSheetProps) {
  return (
    <Sheet open={open} title={exercise ? "Edit exercise" : "New exercise"} onClose={onClose}>
      <ExerciseForm
        key={exercise?.id ?? "new"}
        exercise={exercise}
        onSaved={onSaved}
        onArchiveToggle={onArchiveToggle}
      />
    </Sheet>
  );
}
