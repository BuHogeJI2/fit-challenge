import { useCallback } from "react";
import { archiveExercise, unarchiveExercise, type TExercise } from "../../lib/db";
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

      await archiveExercise(exercise.id);
      toast.show({
        message: `Archived ${exercise.name}. Its history is kept.`,
        action: {
          label: "Undo",
          onAction: async () => {
            try {
              await unarchiveExercise(exercise.id);
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
