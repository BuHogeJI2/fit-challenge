import type { TWeightEntry } from "../../lib/db";
import type { TWeightView } from "../weight-screen/weight-screen.types";

export interface IWeightPeriodPanelProps {
  view: TWeightView;
  period: string;
  entries: TWeightEntry[];
  todayKey: string;
  goalWeightKg: number | null;
  selectedDate: string | null;
  selectedWeek: string | null;
  onSelectDate: (date: string) => void;
  onSelectWeek: (week: string) => void;
  onEdit: (entry: TWeightEntry) => void;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}
