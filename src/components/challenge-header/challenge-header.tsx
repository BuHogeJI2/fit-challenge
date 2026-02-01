import { challengeHeaderClasses } from "./challenge-header.styles";
import type { IChallengeHeaderProps } from "./challenge-header.types";

export function ChallengeHeader({ completedCount }: IChallengeHeaderProps) {
  return (
    <header className={challengeHeaderClasses.wrapper}>
      <div className={challengeHeaderClasses.pill}>
        30-Day Fitness Challenge
      </div>
      <div className={challengeHeaderClasses.layout}>
        <div>
          <h1 className={challengeHeaderClasses.title}>
            Train daily, track your streak.
          </h1>
          <p className={challengeHeaderClasses.description}>
            Stay consistent with a focused plan for each day. Past days show
            completion status, future days are locked until it is time.
          </p>
        </div>
        <div className={challengeHeaderClasses.statsCard}>
          <div className={challengeHeaderClasses.statsLabel}>Completed</div>
          <div className={challengeHeaderClasses.statsValue}>
            {completedCount}
          </div>
          <div className={challengeHeaderClasses.statsFooter}>days so far</div>
        </div>
      </div>
    </header>
  );
}
