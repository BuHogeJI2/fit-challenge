import clsx from "clsx";

export const periodPagerClasses = {
  viewport: clsx("relative -mx-1 overflow-hidden"),
  track: clsx("flex items-start touch-pan-y touch-pinch-zoom will-change-transform"),
  page: clsx("min-w-0 basis-full shrink-0 grow-0 p-1"),
};

export const getTrackClassName = (initialPrevious: boolean) => clsx(periodPagerClasses.track, initialPrevious && "[transform:translate3d(-100%,0,0)]");
