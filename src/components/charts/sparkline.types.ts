import type { TChartPoint } from "../../lib/charts";

export interface ISparklineProps {
  points: TChartPoint[];
  startKey: string;
  endKey: string;
}
