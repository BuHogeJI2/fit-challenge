import type { TExercise, TSet, TSetValues } from "../../lib/db";

export type TReadResult = { ok: true; values: TSetValues } | { ok: false; error: string };

export type TSetSheetState =
  | { mode: "new"; exerciseId?: string }
  | { mode: "edit"; set: TSet }
  | null;

export interface ISetEntryFormProps {
  exercise: TExercise;
  set: TSet | null;
  sets: TSet[];
  todayKey: string;
  onSaved: (set: TSet) => void;
  onDelete?: (set: TSet) => Promise<void>;
}

export interface ISetEntrySheetProps {
  state: TSetSheetState;
  exercises: TExercise[];
  sets: TSet[];
  todayKey: string;
  onClose: () => void;
  onSaved: (set: TSet) => void;
  onDelete?: (set: TSet) => Promise<void>;
}
