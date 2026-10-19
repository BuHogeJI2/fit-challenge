import { useCallback } from "react";
import {
  archiveExerciseWithUndo,
  undoArchiveExercise,
  unarchiveExercise,
  type TExercise,
} from "../../lib/db";
import { useToast } from "../ui";

export const useArchiveToggle = () => {
  const toast = useToast();

  return useCallback(
    async (exercise: TExercise) => {
      if (exercise.archivedAt) {
        await unarchiveExercise(exercise.id);
        toast.show({ message: `Restored ${exercise.name}.` });
        return;
      }

      const undo = await archiveExerciseWithUndo(exercise.id);
      toast.show({
        message: `Archived ${exercise.name}. Its history is kept.`,
        action: {
          label: "Undo",
          onAction: async () => {
            try {
              if (!(await undoArchiveExercise(undo))) {
                toast.show({ message: "Undo is no longer available." });
              }
            } catch {
              toast.show({ message: "Could not undo. Nothing was changed." });
            }
          },
        },
      });
    },
    [toast],
  );
};
