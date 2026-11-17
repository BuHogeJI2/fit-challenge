import type { ReactNode } from "react";

export type TPeriodOffset = -1 | 0 | 1;

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
