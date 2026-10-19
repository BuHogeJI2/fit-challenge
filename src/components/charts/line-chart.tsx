import type { KeyboardEvent } from "react";
import { buildLinePoints, createDateScale, createValueScale, niceTicks } from "../../lib/charts";
import { lineChartClasses } from "./line-chart.styles";
import type { ILineChartProps } from "./line-chart.types";

const WIDTH = 342;
const HEIGHT = 224;
const PLOT_LEFT = 10;
const PLOT_RIGHT = 302;
const PLOT_TOP = 16;
const PLOT_BOTTOM = 196;
const AXIS_LABEL_Y = 216;
const TICK_COUNT = 5;

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
    extra: goalValue === null || !fitGoal ? [] : [goalValue],
  });
  const ticks = niceTicks(valueScale.min, valueScale.max, TICK_COUNT);
  const line = buildLinePoints(points, xScale, valueScale.scale);
  const selected = line.points.find((point) => point.date === selectedDate) ?? null;
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (!step || !line.points.length) return;

    event.preventDefault();
    const index = line.points.findIndex((point) => point.date === selected?.date);
    const nextIndex =
      index === -1
        ? line.points.length - 1
        : Math.min(Math.max(index + step, 0), line.points.length - 1);
    onSelect(line.points[nextIndex].date);
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
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={lineChartClasses.svg} aria-hidden="true">
        <g className={lineChartClasses.grid}>
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={PLOT_RIGHT + 6}
              y1={valueScale.scale(tick)}
              y2={valueScale.scale(tick)}
            />
          ))}
        </g>
        <g className={lineChartClasses.axisText}>
          {ticks.map((tick) => (
            <text key={tick} x={WIDTH} y={valueScale.scale(tick) + 3.5} textAnchor="end">
              {formatValue(tick)}
            </text>
          ))}
          <text x={WIDTH} y={PLOT_TOP - 6} textAnchor="end">
            {unit}
          </text>
          {xLabels.map((xLabel) => (
            <text key={xLabel.date} x={xScale(xLabel.date)} y={AXIS_LABEL_Y} textAnchor="middle">
              {xLabel.label}
            </text>
          ))}
        </g>
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
