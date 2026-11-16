import type { TWeightEntry } from "../../lib/db";
import type { TSavedEntry } from "../../lib/motion";
import type { TWeightEntryWithChange } from "../../lib/stats";

export interface IWeightJournalProps {
  rows: TWeightEntryWithChange[];
  showMonth: boolean;
  todayKey: string;
  onEdit: (entry: TWeightEntry) => void;
  previewCount?: number;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  savedEntry?: TSavedEntry | null;
}
