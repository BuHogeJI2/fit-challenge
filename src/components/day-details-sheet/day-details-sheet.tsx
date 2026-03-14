import { useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  formatExerciseNameForDisplay,
  formatExerciseTarget,
  getDayStateLabel,
} from "../../lib/challenge";
import { Badge, Button, Input, Panel } from "../ui";
import { dayDetailsSheetClasses } from "./day-details-sheet.styles";
import type { IDayDetailsSheetProps } from "./day-details-sheet.types";

export function DayDetailsSheet({
  open,
  day,
  onOpenChange,
  onToggleDayDone,
  onAddExerciseSet,
  onRemoveExerciseSet,
}: IDayDetailsSheetProps) {
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const isDone = day?.state === "done_local";
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const getInputKey = (exerciseId: number) =>
    `${day?.id ?? "none"}:${exerciseId}`;

  const canAddSet = (exerciseId: number) => {
    const parsed = Number(inputValues[getInputKey(exerciseId)] ?? "");
    return Number.isInteger(parsed) && parsed > 0;
  };

  const actionClassName = isDone
    ? dayDetailsSheetClasses.completedAction
    : day?.allExerciseGoalsReached
      ? dayDetailsSheetClasses.readyAction
      : dayDetailsSheetClasses.primaryAction;

  const helperText = useMemo(() => {
    if (!day) return null;
    if (!day.hasLoggedProgress) {
      return "Want to track sets? Add reps as you go. You can still mark the day done without it.";
    }

    if (day.allExerciseGoalsReached && !isDone) {
      return "Your logged sets have reached today's targets. Mark the day done whenever you finish.";
    }

    return null;
  }, [day, isDone]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={dayDetailsSheetClasses.overlay} />
        <Dialog.Content className={dayDetailsSheetClasses.content}>
          <div className={dayDetailsSheetClasses.handle} />
          {day ? (
            <>
              <div className={dayDetailsSheetClasses.header}>
                <div>
                  <div className={dayDetailsSheetClasses.eyebrow}>
                    {getDayStateLabel(day.state)}
                  </div>
                  <Dialog.Title className={dayDetailsSheetClasses.title}>
                    {day.title}
                  </Dialog.Title>
                  <Dialog.Description className={dayDetailsSheetClasses.date}>
                    {day.longDateLabel}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <Button
                    className={dayDetailsSheetClasses.closeButton}
                    size="sm"
                    variant="secondary"
                  >
                    Close
                  </Button>
                </Dialog.Close>
              </div>

              {day.changeNote ? (
                <div className={dayDetailsSheetClasses.changeNote}>
                  Updated: {day.changeNote}
                </div>
              ) : null}

              {day.summary ? (
                <p className={dayDetailsSheetClasses.summary}>{day.summary}</p>
              ) : null}
              {helperText ? (
                <p className={dayDetailsSheetClasses.trackerNote}>
                  {helperText}
                </p>
              ) : null}

              <div className={dayDetailsSheetClasses.scrollArea}>
                {day.notes ? (
                  <Panel
                    className={dayDetailsSheetClasses.notesCard}
                    variant="list"
                  >
                    <div className={dayDetailsSheetClasses.sectionTitle}>
                      Notes
                    </div>
                    {day.notes}
                  </Panel>
                ) : null}

                <div className={dayDetailsSheetClasses.exerciseList}>
                  {day.exercises.map((exercise) => (
                    <Panel
                      key={exercise.id}
                      className={dayDetailsSheetClasses.exerciseCard}
                      variant={exercise.isGoalReached ? "success" : "surface"}
                    >
                      <div className={dayDetailsSheetClasses.exerciseTop}>
                        <div className={dayDetailsSheetClasses.exerciseMain}>
                          <div className={dayDetailsSheetClasses.exerciseHeading}>
                            <div className={dayDetailsSheetClasses.exerciseName}>
                              {formatExerciseNameForDisplay(exercise.exerciseName)}
                            </div>
                            <span
                              aria-hidden="true"
                              className={dayDetailsSheetClasses.exerciseAccent}
                            />
                          </div>
                          <div className={dayDetailsSheetClasses.exerciseMeta}>
                            Exercise target
                          </div>
                          {exercise.notes ? (
                            <div
                              className={dayDetailsSheetClasses.exerciseMeta}
                            >
                              {exercise.notes}
                            </div>
                          ) : null}
                        </div>
                        <div className={dayDetailsSheetClasses.exerciseTopActions}>
                          <Badge
                            className={dayDetailsSheetClasses.exerciseTarget}
                            variant="info"
                          >
                            {formatExerciseTarget(exercise)}
                          </Badge>
                          {exercise.isGoalReached ? (
                            <Badge
                              className={dayDetailsSheetClasses.exerciseCompletedBadge}
                              variant="success"
                            >
                              Goal reached
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className={dayDetailsSheetClasses.trackerStats}>
                        <Panel
                          className={dayDetailsSheetClasses.trackerStat}
                          variant="stat"
                        >
                          <div
                            className={dayDetailsSheetClasses.trackerStatLabel}
                          >
                            Logged
                          </div>
                          <div
                            className={dayDetailsSheetClasses.trackerStatValue}
                          >
                            {exercise.loggedRepsTotal}
                          </div>
                        </Panel>
                        <Panel
                          className={dayDetailsSheetClasses.trackerStat}
                          variant="stat"
                        >
                          <div
                            className={dayDetailsSheetClasses.trackerStatLabel}
                          >
                            Remaining
                          </div>
                          <div
                            className={dayDetailsSheetClasses.trackerStatValue}
                          >
                            {exercise.remainingReps}
                          </div>
                        </Panel>
                        <Panel
                          className={dayDetailsSheetClasses.trackerStat}
                          variant="stat"
                        >
                          <div
                            className={dayDetailsSheetClasses.trackerStatLabel}
                          >
                            Sets
                          </div>
                          <div
                            className={dayDetailsSheetClasses.trackerStatValue}
                          >
                            {exercise.sets.length}
                          </div>
                        </Panel>
                      </div>

                      <Panel
                        className={dayDetailsSheetClasses.formBlock}
                        variant="form"
                      >
                        <div className={dayDetailsSheetClasses.formLabel}>
                          Track next set
                        </div>
                        <div className={dayDetailsSheetClasses.formHint}>
                          Enter reps and add one completed set.
                        </div>
                        <div className={dayDetailsSheetClasses.inputRow}>
                          <Input
                            aria-label={`Add reps for ${formatExerciseNameForDisplay(exercise.exerciseName)}`}
                            className={dayDetailsSheetClasses.repsInput}
                            inputMode="numeric"
                            min={1}
                            pattern="[0-9]*"
                            placeholder="Reps in this set"
                            type="number"
                            value={inputValues[getInputKey(exercise.id)] ?? ""}
                            onChange={(event) =>
                              setInputValues((current) => ({
                                ...current,
                                [getInputKey(exercise.id)]: event.target.value,
                              }))
                            }
                          />
                          <Button
                            className={dayDetailsSheetClasses.addSetButton}
                            disabled={!canAddSet(exercise.id)}
                            type="button"
                            variant="info"
                            onClick={() => {
                              const reps = Number(
                                inputValues[getInputKey(exercise.id)],
                              );
                              onAddExerciseSet(day.dayNumber, exercise.id, reps);
                              setInputValues((current) => ({
                                ...current,
                                [getInputKey(exercise.id)]: "",
                              }));
                            }}
                          >
                            Add set
                          </Button>
                        </div>
                      </Panel>

                      {exercise.sets.length ? (
                        <div className={dayDetailsSheetClasses.setsGroup}>
                          <div className={dayDetailsSheetClasses.sectionTitle}>
                            Logged sets
                          </div>
                          <div className={dayDetailsSheetClasses.setsList}>
                            {exercise.sets.map((set, index) => (
                              <Panel
                                key={set.id}
                                className={dayDetailsSheetClasses.setItem}
                                variant="list"
                              >
                                <div className={dayDetailsSheetClasses.setMeta}>
                                  Set {index + 1} •{" "}
                                  <span
                                    className={dayDetailsSheetClasses.setValue}
                                  >
                                    {set.reps} reps
                                  </span>
                                </div>
                                <Button
                                  className={
                                    dayDetailsSheetClasses.removeSetButton
                                  }
                                  size="sm"
                                  type="button"
                                  variant="destructive"
                                  onClick={() =>
                                    onRemoveExerciseSet(
                                      day.dayNumber,
                                      exercise.id,
                                      set.id,
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              </Panel>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </Panel>
                  ))}
                </div>

                <div className={dayDetailsSheetClasses.actionRow}>
                  {day.isActionable ? (
                    <Button
                      ref={actionButtonRef}
                      className={actionClassName}
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        onToggleDayDone(day.dayNumber, {
                          willMarkDone: !isDone,
                          triggerElement: actionButtonRef.current,
                        })
                      }
                    >
                      {isDone ? "Undo completion" : "Mark done"}
                    </Button>
                  ) : null}
                  <Dialog.Close asChild>
                    <Button
                      className={dayDetailsSheetClasses.secondaryAction}
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
