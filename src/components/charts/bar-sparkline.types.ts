import type { TChartPoint } from "../../lib/charts";

export interface IBarSparklineProps {
  bars: TChartPoint[];
  startKey: string;
  endKey: string;
  stepDays: number;
}
