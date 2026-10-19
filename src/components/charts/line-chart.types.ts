import type { TChartPoint } from "../../lib/charts";

export type TAxisLabel = {
  date: string;
  label: string;
};

export interface ILineChartProps {
  points: TChartPoint[];
  startKey: string;
  endKey: string;
  xLabels: TAxisLabel[];
  goalValue?: number | null;
  fitGoal?: boolean;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  formatValue: (value: number) => string;
  unit: string;
  label: string;
  minSpan?: number;
}
