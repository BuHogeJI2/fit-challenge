import type { TValueScale } from "../../lib/charts";
import type { TAxisLabel } from "./line-chart.types";

export interface IChartAxesProps {
  ticks: number[];
  valueScale: TValueScale;
  xLabels: TAxisLabel[];
  xPosition: (dateKey: string) => number;
  formatValue: (value: number) => string;
  unit: string;
}
