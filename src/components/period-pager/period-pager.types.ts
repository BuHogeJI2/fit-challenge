import type { ReactNode } from "react";

export type TPeriodOffset = -1 | 0 | 1;

export type TPeriodDirection = "previous" | "next";

export type TMotion = "none" | "settle" | "snap";

export interface IPeriodPagerControls {
  onPrevious: () => void;
  onNext: () => void;
}

export interface IPeriodPagerProps {
  periodKey: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  renderPage: (offset: TPeriodOffset, controls: IPeriodPagerControls) => ReactNode;
}

export interface IPagerPageProps {
  offset: TPeriodOffset;
  controls: IPeriodPagerControls;
  renderPage: IPeriodPagerProps["renderPage"];
}

export type TDragSample = {
  x: number;
  time: number;
};

export type TDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  baseOffset: number;
  width: number;
  isLocked: boolean;
  samples: TDragSample[];
};

export type TPendingSettle = {
  periodKey: string;
  fromOffset: number;
};
