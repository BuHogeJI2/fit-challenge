import type { TWeightEntry } from "../../lib/db";

export interface IWeightWeekDetailProps {
  weekStart: string;
  entries: TWeightEntry[];
  todayKey: string;
  goalWeightKg: number | null;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onEdit: (entry: TWeightEntry) => void;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  backHref: string;
}
