import type { KeyboardEvent } from "react";
import { buildLinePoints, createDateScale, createValueScale, niceTicks } from "../../lib/charts";
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
import { lineChartClasses } from "./line-chart.styles";
import type { ILineChartProps } from "./line-chart.types";

export function LineChart({
  points,
  startKey,
  endKey,
  xLabels,
  goalValue = null,
  fitGoal = false,
  selectedDate,
  onSelect,
  formatValue,
  unit,
  label,
  minSpan,
}: ILineChartProps) {
  const xScale = createDateScale({ startKey, endKey, x0: PLOT_LEFT, x1: PLOT_RIGHT });
  const valueScale = createValueScale({
    values: points.map((point) => point.value),
    y0: PLOT_BOTTOM,
    y1: PLOT_TOP,
    minSpan,
    floor: 0,
    extra: goalValue === null || !fitGoal ? [] : [goalValue],
  });
  const ticks = niceTicks(valueScale.min, valueScale.max, TICK_COUNT);
  const line = buildLinePoints(points, xScale, valueScale.scale);
  const selected = line.points.find((point) => point.date === selectedDate) ?? null;
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = getKeyboardSelection(
      event.key,
      line.points.map((point) => point.date),
      selected?.date ?? null,
    );
    if (next === null) return;

    event.preventDefault();
    onSelect(next);
  };

  const goalY =
    goalValue === null || goalValue < valueScale.min || goalValue > valueScale.max
      ? null
      : valueScale.scale(goalValue);

  return (
    <figure
      className={lineChartClasses.figure}
      tabIndex={0}
      aria-label={`${label}. Use the left and right arrow keys to move between points.`}
      onKeyDown={handleKeyDown}
    >
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className={lineChartClasses.svg} aria-hidden="true">
        <ChartAxes
          ticks={ticks}
          valueScale={valueScale.scale}
          xLabels={xLabels}
          xPosition={xScale}
          formatValue={formatValue}
          unit={unit}
        />
        {goalY !== null && goalValue !== null ? (
          <g>
            <line
              className={lineChartClasses.goalLine}
              x1={0}
              x2={PLOT_RIGHT + 6}
              y1={goalY}
              y2={goalY}
            />
            <text className={lineChartClasses.goalText} x={2} y={goalY - 5}>
              Goal {formatValue(goalValue)}
            </text>
          </g>
        ) : null}
        {line.points.length > 1 ? (
          <polyline className={lineChartClasses.line} points={line.svgPoints} />
        ) : null}
        {line.points.map((point) => (
          <circle
            key={point.date}
            className={
              point.date === selected?.date
                ? lineChartClasses.pointSelected
                : lineChartClasses.point
            }
            cx={point.x}
            cy={point.y}
            r={point.date === selected?.date ? 5 : 3.5}
          />
        ))}
        <g aria-hidden="true">
          {line.points.map((point) => (
            <circle
              key={point.date}
              data-testid={`chart-point-${point.date}`}
              className={lineChartClasses.hitArea}
              cx={point.x}
              cy={point.y}
              r={14}
              onClick={() => onSelect(point.date)}
            />
          ))}
        </g>
      </svg>
    </figure>
  );
}
