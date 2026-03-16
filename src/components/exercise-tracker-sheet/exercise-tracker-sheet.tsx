import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  formatExerciseNameForDisplay,
  formatExerciseTarget,
} from "../../lib/challenge";
import { SetSequence } from "../set-sequence";
import { Badge, Button, Input, Panel } from "../ui";
import { exerciseTrackerSheetClasses } from "./exercise-tracker-sheet.styles";
import type { IExerciseTrackerSheetProps } from "./exercise-tracker-sheet.types";

export function ExerciseTrackerSheet({
  open,
  day,
  exercise,
  onOpenChange,
  onSelectExercise,
  onAddExerciseSet,
  onRemoveExerciseSet,
}: IExerciseTrackerSheetProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const inputKey = `${day?.id ?? "none"}:${exercise?.id ?? "none"}`;
  const inputValue = inputValues[inputKey] ?? "";
  const parsed = Number(inputValue);
  const canAddSet = Number.isInteger(parsed) && parsed > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={exerciseTrackerSheetClasses.overlay} />
        <Dialog.Content className={exerciseTrackerSheetClasses.content}>
          <div className={exerciseTrackerSheetClasses.handle} />
          {day ? (
            <>
              <div className={exerciseTrackerSheetClasses.header}>
                <div>
                  <div className={exerciseTrackerSheetClasses.eyebrow}>
                    {day.title}
                  </div>
                  <Dialog.Title className={exerciseTrackerSheetClasses.title}>
                    {exercise
                      ? formatExerciseNameForDisplay(exercise.exerciseName)
                      : "Choose an exercise"}
                  </Dialog.Title>
                  <Dialog.Description
                    className={exerciseTrackerSheetClasses.date}
                  >
                    {day.longDateLabel}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <Button
                    className={exerciseTrackerSheetClasses.closeButton}
                    size="sm"
                    variant="secondary"
                  >
                    Close
                  </Button>
                </Dialog.Close>
              </div>

              <p className={exerciseTrackerSheetClasses.helper}>
                {exercise
                  ? "Track sets for this exercise here. The main screen updates as soon as you log or remove a set."
                  : "Choose which exercise you want to track for this day."}
              </p>

              <div className={exerciseTrackerSheetClasses.scrollArea}>
                {exercise ? (
                  <>
                    <Panel
                      className={exerciseTrackerSheetClasses.summaryCard}
                      variant="surface"
                    >
                      <div className={exerciseTrackerSheetClasses.summaryTitle}>
                        Exercise target
                      </div>
                      <div className={exerciseTrackerSheetClasses.summaryMetrics}>
                        <Badge
                          className={exerciseTrackerSheetClasses.summaryMetric}
                          variant="info"
                        >
                          {formatExerciseTarget(exercise)}
                        </Badge>
                        <Badge
                          className={exerciseTrackerSheetClasses.summaryMetric}
                          variant={exercise.isGoalReached ? "success" : "neutral"}
                        >
                          {exercise.loggedRepsTotal} / {exercise.targetReps ?? 0}
                        </Badge>
                        <div className={exerciseTrackerSheetClasses.summarySetCount}>
                          {exercise.sets.length} set{exercise.sets.length === 1 ? "" : "s"}
                        </div>
                        {exercise.isGoalReached ? (
                          <Badge variant="success">Goal reached</Badge>
                        ) : null}
                      </div>
                      <div className={exerciseTrackerSheetClasses.summaryBody}>
                        {exercise.notes ??
                          "Log each completed set here and keep the count moving toward the target."}
                      </div>
                    </Panel>

                    <Panel
                      className={exerciseTrackerSheetClasses.formBlock}
                      variant="form"
                    >
                      <div className={exerciseTrackerSheetClasses.formLabel}>
                        Track next set
                      </div>
                      <div className={exerciseTrackerSheetClasses.formHint}>
                        Enter reps and add one completed set.
                      </div>
                      <div className={exerciseTrackerSheetClasses.inputRow}>
                        <Input
                          aria-label={`Add reps for ${formatExerciseNameForDisplay(exercise.exerciseName)}`}
                          className={exerciseTrackerSheetClasses.repsInput}
                          inputMode="numeric"
                          min={1}
                          pattern="[0-9]*"
                          placeholder="Reps"
                          type="number"
                          value={inputValue}
                          onChange={(event) =>
                            setInputValues((current) => ({
                              ...current,
                              [inputKey]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          className={exerciseTrackerSheetClasses.addSetButton}
                          disabled={!canAddSet}
                          type="button"
                          variant="info"
                          onClick={() => {
                            onAddExerciseSet(day.dayNumber, exercise.id, parsed);
                            setInputValues((current) => ({
                              ...current,
                              [inputKey]: "",
                            }));
                          }}
                        >
                          Add set
                        </Button>
                      </div>
                    </Panel>

                    <SetSequence
                      emptyLabel="No sets logged for this exercise yet."
                      sets={exercise.sets}
                      title="Logged sets"
                      onRemoveSet={(setId) =>
                        onRemoveExerciseSet(day.dayNumber, exercise.id, setId)
                      }
                    />
                  </>
                ) : (
                  <div className={exerciseTrackerSheetClasses.exercisePicker}>
                    {day.exercises.map((dayExercise) => (
                      <button
                        key={dayExercise.id}
                        type="button"
                        className={exerciseTrackerSheetClasses.exercisePickerButton}
                        onClick={() => onSelectExercise(dayExercise.id)}
                      >
                        <div className={exerciseTrackerSheetClasses.exercisePickerMain}>
                          <div className={exerciseTrackerSheetClasses.exercisePickerName}>
                            {formatExerciseNameForDisplay(dayExercise.exerciseName)}
                          </div>
                          <div className={exerciseTrackerSheetClasses.exercisePickerMeta}>
                            {dayExercise.loggedRepsTotal} / {dayExercise.targetReps ?? 0} logged • {dayExercise.sets.length} set{dayExercise.sets.length === 1 ? "" : "s"}
                          </div>
                        </div>
                        <Badge variant="info">
                          {formatExerciseTarget(dayExercise)}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {day.notes ? (
                  <Panel
                    className={exerciseTrackerSheetClasses.notesCard}
                    variant="list"
                  >
                    {day.notes}
                  </Panel>
                ) : null}

                <div className={exerciseTrackerSheetClasses.actionRow}>
                  <Dialog.Close asChild>
                    <Button
                      className={exerciseTrackerSheetClasses.secondaryAction}
                      variant="secondary"
                    >
                      Back to challenge
                    </Button>
                  </Dialog.Close>
                </div>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
