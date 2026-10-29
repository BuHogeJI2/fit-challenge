import type { KeyboardEvent } from "react";
import { createBandScale, createValueScale, niceTicks } from "../../lib/charts";
import { barChartClasses } from "./bar-chart.styles";
import type { IBarChartProps } from "./bar-chart.types";
import { ChartAxes } from "./chart-axes";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  getKeyboardSelection,
  PLOT_BOTTOM,
  PLOT_LEFT,
  PLOT_RIGHT,
  PLOT_TOP,
  TICK_COUNT,
} from "./chart-frame";

const BAR_FILL = 0.7;
const MAX_BAR_WIDTH = 24;

export function BarChart({
  bars,
  startKey,
  endKey,
  stepDays,
  xLabels,
  selectedDate,
  onSelect,
  formatValue,
  unit,
  label,
  minSpan,
}: IBarChartProps) {
  const band = createBandScale({ startKey, endKey, stepDays, x0: PLOT_LEFT, x1: PLOT_RIGHT });
  const valueScale = createValueScale({
    values: bars.map((bar) => bar.value),
    y0: PLOT_BOTTOM,
    y1: PLOT_TOP,
    minSpan,
    floor: 0,
    extra: [0],
  });
  const ticks = niceTicks(valueScale.min, valueScale.max, TICK_COUNT);
  const sorted = [...bars].sort((left, right) => left.date.localeCompare(right.date));
  const barWidth = Math.min(band.bandwidth * BAR_FILL, MAX_BAR_WIDTH);
  const baseline = valueScale.scale(0);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = getKeyboardSelection(event.key, sorted.map((bar) => bar.date), selectedDate);
    if (next === null) return;

    event.preventDefault();
    onSelect(next);
  };

  return (
    <figure
      className={barChartClasses.figure}
      tabIndex={0}
      aria-label={`${label}. Use the left and right arrow keys to move between bars.`}
      onKeyDown={handleKeyDown}
    >
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className={barChartClasses.svg} aria-hidden="true">
        <ChartAxes
          ticks={ticks}
          valueScale={valueScale.scale}
          xLabels={xLabels}
          xPosition={band.center}
          formatValue={formatValue}
          unit={unit}
        />
        {sorted.map((bar) => {
          const top = valueScale.scale(bar.value);
          return (
            <rect
              key={bar.date}
              className={bar.date === selectedDate ? barChartClasses.barSelected : barChartClasses.bar}
              x={band.center(bar.date) - barWidth / 2}
              y={top}
              width={barWidth}
              height={baseline - top}
            />
          );
        })}
        <g aria-hidden="true">
          {sorted.map((bar) => (
            <rect
              key={bar.date}
              data-testid={`chart-bar-${bar.date}`}
              className={barChartClasses.hitArea}
              x={band.center(bar.date) - band.bandwidth / 2}
              y={PLOT_TOP}
              width={band.bandwidth}
              height={PLOT_BOTTOM - PLOT_TOP}
              onClick={() => onSelect(bar.date)}
            />
          ))}
        </g>
      </svg>
    </figure>
  );
}
