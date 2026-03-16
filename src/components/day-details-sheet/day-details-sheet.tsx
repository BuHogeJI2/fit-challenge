import { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  formatExerciseNameForDisplay,
  formatExerciseTarget,
  getDayStateLabel,
} from "../../lib/challenge";
import { Badge, Button, Panel } from "../ui";
import { dayDetailsSheetClasses } from "./day-details-sheet.styles";
import type { IDayDetailsSheetProps } from "./day-details-sheet.types";

export function DayDetailsSheet({
  open,
  day,
  showPastActions = false,
  completionActionLabel,
  onOpenChange,
  onTrackSets,
  onToggleComplete,
}: IDayDetailsSheetProps) {
  const isUpcoming = day?.state === "upcoming";

  const helperText = useMemo(() => {
    if (!day) return null;
    if (isUpcoming) {
      return "This day is coming up next. Review the plan now; tracking unlocks on the day.";
    }

    if (showPastActions) {
      return "Review the plan for this day here. If you need to catch up, the progress actions are below.";
    }

    return "Review the plan for this day here.";
  }, [day, isUpcoming, showPastActions]);

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
                      variant="surface"
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
                        </div>
                      </div>
                    </Panel>
                  ))}
                </div>

                {showPastActions ? (
                  <Panel
                    className={dayDetailsSheetClasses.pastActions}
                    variant="form"
                  >
                    <div className={dayDetailsSheetClasses.pastActionsTitle}>
                      Catch up on this day
                    </div>
                    <div className={dayDetailsSheetClasses.pastActionsMeta}>
                      Track missed sets or update completion without leaving this review.
                    </div>
                    <div className={dayDetailsSheetClasses.pastActionsButtons}>
                      <Button
                        className={dayDetailsSheetClasses.primaryAction}
                        type="button"
                        variant="info"
                        onClick={onTrackSets}
                      >
                        Track sets
                      </Button>
                      <Button
                        className={dayDetailsSheetClasses.secondaryAction}
                        type="button"
                        variant="secondary"
                        onClick={() => onToggleComplete?.()}
                      >
                        {completionActionLabel}
                      </Button>
                    </div>
                  </Panel>
                ) : null}

                <div className={dayDetailsSheetClasses.actionRow}>
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
