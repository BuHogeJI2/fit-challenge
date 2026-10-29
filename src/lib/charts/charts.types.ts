export type TDateScaleOptions = {
  startKey: string;
  endKey: string;
  x0: number;
  x1: number;
};

export type TValueScaleOptions = {
  values: readonly number[];
  y0: number;
  y1: number;
  minSpan?: number;
  floor?: number;
  extra?: readonly number[];
};

export type TBandScaleOptions = TDateScaleOptions & {
  stepDays: number;
};

export type TBandScale = {
  bandwidth: number;
  center: (dateKey: string) => number;
};

export type TDateScale = (dateKey: string) => number;
export type TValueScale = (value: number) => number;

export type TValueScaleResult = {
  min: number;
  max: number;
  scale: TValueScale;
};

export type TChartPoint = {
  date: string;
  value: number;
};

export type TLinePoint = TChartPoint & {
  x: number;
  y: number;
};

export type TLinePoints = {
  points: TLinePoint[];
  svgPoints: string;
};
