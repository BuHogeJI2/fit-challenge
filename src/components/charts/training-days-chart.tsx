import { formatDayOfMonth, formatWeekdayShort } from "../../lib/dates";
import { trainingDaysChartClasses as classes } from "./training-days-chart.styles";
import type { ITrainingDaysChartProps } from "./training-days-chart.types";

const WIDTH = 342;
const HEIGHT = 112;
const BASELINE = 76;
const MAX_BAR = 48;
const BAR_WIDTH = 24;
const COLUMN = WIDTH / 7;

export function TrainingDaysChart({ days, todayKey }: ITrainingDaysChartProps) {
  // Two trainings fill the height, so a single one never looks like a full day.
  const unit = MAX_BAR / Math.max(2, ...days.map((day) => day.count));
  const label = `Trainings per day: ${days.map((day) => `${formatWeekdayShort(day.date)} ${day.count}`).join(", ")}`;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={classes.svg} role="img" aria-label={label}>
      {days.map((day, index) => {
        const center = COLUMN * index + COLUMN / 2;
        const height = day.count * unit;
        const isLater = day.date > todayKey;
        return (
          <g key={day.date} data-testid={`training-day-${day.date}`}>
            {day.count ? (
              <>
                <rect className={classes.bar} x={center - BAR_WIDTH / 2} y={BASELINE - height} width={BAR_WIDTH} height={height} rx={4} />
                <text className={classes.count} x={center} y={BASELINE - height - 7} textAnchor="middle">{day.count}</text>
              </>
            ) : isLater ? null : (
              <path className={classes.empty} d={`M${center - 10} ${BASELINE}H${center + 10}`} />
            )}
            <text className={isLater ? classes.weekdayLater : classes.weekday} x={center} y={95} textAnchor="middle">{formatWeekdayShort(day.date)}</text>
            <text className={classes.day} x={center} y={109} textAnchor="middle">{formatDayOfMonth(day.date)}</text>
          </g>
        );
      })}
    </svg>
  );
}
