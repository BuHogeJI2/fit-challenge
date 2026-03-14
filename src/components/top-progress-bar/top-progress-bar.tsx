import { getCompletionPercent } from "../../lib/challenge";
import { topProgressBarClasses } from "./top-progress-bar.styles";
import type { ITopProgressBarProps } from "./top-progress-bar.types";

export function TopProgressBar({
  localCompletedDays,
  totalDays,
  scheduleCompletedDays,
}: ITopProgressBarProps) {
  const localPercent = getCompletionPercent(localCompletedDays, totalDays);

  return (
    <section className={topProgressBarClasses.wrapper}>
      <div className={topProgressBarClasses.header}>
        <div>
          <div className={topProgressBarClasses.title}>Your progress</div>
          <div className={topProgressBarClasses.meta}>
            {localCompletedDays} of {totalDays} days marked done on this device
          </div>
        </div>
        <div className={topProgressBarClasses.value}>{localPercent}%</div>
      </div>

      <div
        aria-label="Local completion progress"
        aria-valuemax={totalDays}
        aria-valuemin={0}
        aria-valuenow={localCompletedDays}
        className={topProgressBarClasses.track}
        role="progressbar"
      >
        <div
          className={topProgressBarClasses.fill}
          style={{ width: `${localPercent}%` }}
        />
      </div>

      <div className={topProgressBarClasses.footer}>
        <span>Keep stacking completed days.</span>
        <span className={topProgressBarClasses.footerStrong}>
          Official run: Day {scheduleCompletedDays} of {totalDays}
        </span>
      </div>
    </section>
  );
}
