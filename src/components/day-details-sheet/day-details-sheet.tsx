import { useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { formatExerciseTarget, getDayStateLabel } from "../../lib/challenge";
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
                <Dialog.Close className={dayDetailsSheetClasses.closeButton}>
                  Close
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
                  <div className={dayDetailsSheetClasses.notesCard}>
                    <div className={dayDetailsSheetClasses.sectionTitle}>
                      Notes
                    </div>
                    {day.notes}
                  </div>
                ) : null}

                <div className={dayDetailsSheetClasses.exerciseList}>
                  {day.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={dayDetailsSheetClasses.exerciseCard}
                    >
                      <div className={dayDetailsSheetClasses.exerciseTop}>
                        <div className={dayDetailsSheetClasses.exerciseMain}>
                          <div
                            className={dayDetailsSheetClasses.exerciseNameBadge}
                          >
                            {exercise.exerciseName}
                          </div>
                          <div className={dayDetailsSheetClasses.exerciseMeta}>
                            Daily target
                          </div>
                          {exercise.notes ? (
                            <div
                              className={dayDetailsSheetClasses.exerciseMeta}
                            >
                              {exercise.notes}
                            </div>
                          ) : null}
                        </div>
                        <div className={dayDetailsSheetClasses.exerciseTarget}>
                          {formatExerciseTarget(exercise)}
                        </div>
                      </div>

                      <div className={dayDetailsSheetClasses.trackerStats}>
                        <div className={dayDetailsSheetClasses.trackerStat}>
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
                        </div>
                        <div className={dayDetailsSheetClasses.trackerStat}>
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
                        </div>
                        <div className={dayDetailsSheetClasses.trackerStat}>
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
                        </div>
                      </div>

                      <div className={dayDetailsSheetClasses.inputRow}>
                        <input
                          aria-label={`Add reps for ${exercise.exerciseName}`}
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
                        <button
                          type="button"
                          className={
                            canAddSet(exercise.id)
                              ? dayDetailsSheetClasses.addSetButton
                              : dayDetailsSheetClasses.disabledAddSetButton
                          }
                          disabled={!canAddSet(exercise.id)}
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
                        </button>
                      </div>

                      {exercise.sets.length ? (
                        <div className={dayDetailsSheetClasses.setsList}>
                          {exercise.sets.map((set, index) => (
                            <div
                              key={set.id}
                              className={dayDetailsSheetClasses.setItem}
                            >
                              <div className={dayDetailsSheetClasses.setMeta}>
                                Set {index + 1} •{" "}
                                <span
                                  className={dayDetailsSheetClasses.setValue}
                                >
                                  {set.reps} reps
                                </span>
                              </div>
                              <button
                                type="button"
                                className={
                                  dayDetailsSheetClasses.removeSetButton
                                }
                                onClick={() =>
                                  onRemoveExerciseSet(
                                    day.dayNumber,
                                    exercise.id,
                                    set.id,
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className={dayDetailsSheetClasses.actionRow}>
                  {day.isActionable ? (
                    <button
                      ref={actionButtonRef}
                      type="button"
                      className={actionClassName}
                      onClick={() =>
                        onToggleDayDone(day.dayNumber, {
                          willMarkDone: !isDone,
                          triggerElement: actionButtonRef.current,
                        })
                      }
                    >
                      {isDone ? "Undo completion" : "Mark done"}
                    </button>
                  ) : null}
                  <Dialog.Close
                    className={dayDetailsSheetClasses.secondaryAction}
                  >
                    Back to challenge
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
