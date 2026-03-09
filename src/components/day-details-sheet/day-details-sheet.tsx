import * as Dialog from "@radix-ui/react-dialog";
import {
  formatExerciseTarget,
  getDayStateLabel,
} from "../../lib/challenge";
import { dayDetailsSheetClasses } from "./day-details-sheet.styles";
import type { IDayDetailsSheetProps } from "./day-details-sheet.types";

export function DayDetailsSheet({
  open,
  day,
  onOpenChange,
  onToggleDayDone,
}: IDayDetailsSheetProps) {
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

              <div className={dayDetailsSheetClasses.scrollArea}>
                {day.notes ? (
                  <div className={dayDetailsSheetClasses.notesCard}>
                    <div className={dayDetailsSheetClasses.sectionTitle}>Notes</div>
                    {day.notes}
                  </div>
                ) : null}

                <div className={dayDetailsSheetClasses.exerciseList}>
                  {day.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={dayDetailsSheetClasses.exerciseCard}
                    >
                      <div className={dayDetailsSheetClasses.exerciseName}>
                        {exercise.exerciseName}
                      </div>
                      <div className={dayDetailsSheetClasses.exerciseMeta}>
                        {formatExerciseTarget(exercise)}
                      </div>
                      {exercise.notes ? (
                        <div className={dayDetailsSheetClasses.exerciseMeta}>
                          {exercise.notes}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className={dayDetailsSheetClasses.actionRow}>
                  {day.isActionable ? (
                    <button
                      type="button"
                      className={day.state === "done_local"
                        ? dayDetailsSheetClasses.secondaryAction
                        : dayDetailsSheetClasses.primaryAction}
                      onClick={() => onToggleDayDone(day.dayNumber)}
                    >
                      {day.state === "done_local" ? "Undo completion" : "Mark done"}
                    </button>
                  ) : null}
                  <Dialog.Close className={dayDetailsSheetClasses.secondaryAction}>
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
