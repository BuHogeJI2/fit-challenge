import type { TWeightEntry } from "../../lib/db";
import type { TWeightEntryWithChange } from "../../lib/stats";

export interface IWeightJournalProps {
  rows: TWeightEntryWithChange[];
  showMonth: boolean;
  todayKey: string;
  onEdit: (entry: TWeightEntry) => void;
}
