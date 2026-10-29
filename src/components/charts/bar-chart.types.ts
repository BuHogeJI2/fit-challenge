import type { TChartPoint } from "../../lib/charts";
import type { TAxisLabel } from "./line-chart.types";

export interface IBarChartProps {
  bars: TChartPoint[];
  startKey: string;
  endKey: string;
  stepDays: number;
  xLabels: TAxisLabel[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  formatValue: (value: number) => string;
  unit: string;
  label: string;
  minSpan?: number;
}
