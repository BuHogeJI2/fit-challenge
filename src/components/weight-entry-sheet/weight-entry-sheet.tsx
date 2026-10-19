import { Sheet } from "../ui";
import { WeightEntryForm } from "../weight-entry-form";
import type { IWeightEntrySheetProps } from "./weight-entry-sheet.types";

export function WeightEntrySheet({
  state,
  entries,
  todayKey,
  onClose,
  onSaved,
  onDelete,
}: IWeightEntrySheetProps) {
  const entry = state?.mode === "edit" ? state.entry : null;

  return (
    <Sheet open={state !== null} title={entry ? "Edit weigh-in" : "Log weight"} onClose={onClose}>
      <WeightEntryForm
        key={entry?.id ?? "new"}
        entry={entry}
        entries={entries}
        todayKey={todayKey}
        submitLabel="Save"
        autoFocus
        onSaved={onSaved}
        onDelete={entry ? () => onDelete(entry) : undefined}
      />
    </Sheet>
  );
}
