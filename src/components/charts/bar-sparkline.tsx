import { createBandScale, createValueScale } from "../../lib/charts";
import { barSparklineClasses } from "./bar-sparkline.styles";
import type { IBarSparklineProps } from "./bar-sparkline.types";

const WIDTH = 342;
const HEIGHT = 32;
const INSET = 1;
const BAR_FILL = 0.7;
const MAX_BAR_WIDTH = 8;

export function BarSparkline({ bars, startKey, endKey, stepDays }: IBarSparklineProps) {
  if (!bars.length) return null;

  const band = createBandScale({ startKey, endKey, stepDays, x0: INSET, x1: WIDTH - INSET });
  const { scale: yScale } = createValueScale({
    values: bars.map((bar) => bar.value),
    y0: HEIGHT,
    y1: INSET,
    floor: 0,
    extra: [0],
  });
  const barWidth = Math.min(band.bandwidth * BAR_FILL, MAX_BAR_WIDTH);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={barSparklineClasses.svg}
      aria-hidden="true"
      focusable="false"
    >
      {bars.map((bar) => {
        const top = yScale(bar.value);
        return (
          <rect
            key={bar.date}
            className={barSparklineClasses.bar}
            x={band.center(bar.date) - barWidth / 2}
            y={top}
            width={barWidth}
            height={HEIGHT - top}
          />
        );
      })}
    </svg>
  );
}
