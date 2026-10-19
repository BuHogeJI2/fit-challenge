import { buildLinePoints, createDateScale, createValueScale } from "../../lib/charts";
import { sparklineClasses } from "./sparkline.styles";
import type { ISparklineProps } from "./sparkline.types";

const WIDTH = 342;
const HEIGHT = 32;
const INSET = 3;

export function Sparkline({ points, startKey, endKey }: ISparklineProps) {
  if (!points.length) return null;

  const xScale = createDateScale({ startKey, endKey, x0: INSET, x1: WIDTH - INSET });
  const { scale: yScale } = createValueScale({
    values: points.map((point) => point.value),
    y0: HEIGHT - INSET,
    y1: INSET,
    minSpan: 1,
  });
  const line = buildLinePoints(points, xScale, yScale);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={sparklineClasses.svg}
      aria-hidden="true"
      focusable="false"
    >
      {line.points.length === 1 ? (
        <circle className={sparklineClasses.point} cx={line.points[0].x} cy={line.points[0].y} r={2.5} />
      ) : (
        <polyline className={sparklineClasses.line} vectorEffect="non-scaling-stroke" points={line.svgPoints} />
      )}
    </svg>
  );
}
