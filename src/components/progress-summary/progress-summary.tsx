import { getCompletionPercent } from "../../lib/challenge";
import { progressSummaryClasses } from "./progress-summary.styles";
import type { IProgressSummaryProps } from "./progress-summary.types";

export function ProgressSummary({
  scheduleCompletedDays,
  scheduleTotalDays,
  localCompletedDays,
  remainingDays,
  phaseLabel,
}: IProgressSummaryProps) {
  const schedulePercent = getCompletionPercent(
    scheduleCompletedDays,
    scheduleTotalDays,
  );
  const localPercent = getCompletionPercent(
    localCompletedDays,
    scheduleTotalDays,
  );

  return (
    <section className={progressSummaryClasses.wrapper}>
      <div className={progressSummaryClasses.header}>
        <div>
          <h2 className={progressSummaryClasses.title}>Progress</h2>
          <p className={progressSummaryClasses.phase}>{phaseLabel}</p>
        </div>
      </div>

      <div className={progressSummaryClasses.grid}>
        <div className={progressSummaryClasses.card}>
          <div className={progressSummaryClasses.label}>Schedule</div>
          <div className={progressSummaryClasses.value}>
            {scheduleCompletedDays}/{scheduleTotalDays}
          </div>
          <div className={progressSummaryClasses.meta}>
            {schedulePercent}% through the calendar
          </div>
        </div>

        <div className={progressSummaryClasses.card}>
          <div className={progressSummaryClasses.label}>Local completion</div>
          <div className={progressSummaryClasses.value}>{localCompletedDays}</div>
          <div className={progressSummaryClasses.meta}>
            {localPercent}% marked done on this device
          </div>
        </div>

        <div className={progressSummaryClasses.card}>
          <div className={progressSummaryClasses.label}>Remaining days</div>
          <div className={progressSummaryClasses.value}>{remainingDays}</div>
          <div className={progressSummaryClasses.meta}>
            Days left in the official run
          </div>
        </div>
      </div>
    </section>
  );
}
