import { chartAxesClasses } from "./chart-axes.styles";
import type { IChartAxesProps } from "./chart-axes.types";
import { AXIS_LABEL_Y, CHART_WIDTH, PLOT_RIGHT } from "./chart-frame";

export function ChartAxes({ ticks, valueScale, xLabels, xPosition, formatValue, unit }: IChartAxesProps) {
  return (
    <>
      <g className={chartAxesClasses.grid}>
        {ticks.map((tick) => (
          <line key={tick} x1={0} x2={PLOT_RIGHT + 6} y1={valueScale(tick)} y2={valueScale(tick)} />
        ))}
      </g>
      <g className={chartAxesClasses.axisText}>
        {ticks.map((tick) => (
          <text key={tick} x={CHART_WIDTH} y={valueScale(tick) + 3.5} textAnchor="end">
            {formatValue(tick)}
          </text>
        ))}
        <text x={CHART_WIDTH} y={AXIS_LABEL_Y} textAnchor="end">
          {unit}
        </text>
        {xLabels.map((xLabel) => (
          <text key={xLabel.date} x={xPosition(xLabel.date)} y={AXIS_LABEL_Y} textAnchor="middle">
            {xLabel.label}
          </text>
        ))}
      </g>
    </>
  );
}
