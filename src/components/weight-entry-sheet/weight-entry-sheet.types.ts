import type { TWeightEntry } from "../../lib/db";
import type { TWeightSheetState } from "../weight-screen/weight-screen.types";

export interface IWeightEntrySheetProps {
  state: TWeightSheetState;
  entries: TWeightEntry[];
  todayKey: string;
  onClose: () => void;
  onSaved: (entry: TWeightEntry) => void;
  onDelete: (entry: TWeightEntry) => Promise<void>;
}
