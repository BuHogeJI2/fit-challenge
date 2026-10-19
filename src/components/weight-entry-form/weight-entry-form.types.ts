import type { TWeightEntry } from "../../lib/db";

export interface IWeightEntryFormProps {
  entry: TWeightEntry | null;
  entries: TWeightEntry[];
  todayKey: string;
  lead?: string;
  submitLabel: string;
  autoFocus?: boolean;
  onSaved: (entry: TWeightEntry) => void;
  onDelete?: () => Promise<void>;
}
