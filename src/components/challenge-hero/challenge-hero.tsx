import { challengeHeroClasses } from "./challenge-hero.styles";
import type { IChallengeHeroProps } from "./challenge-hero.types";

export function ChallengeHero({
  title,
  description,
  rangeLabel,
  statusLabel,
  coverNote,
  localCompletedDays,
  totalDays,
}: IChallengeHeroProps) {
  return (
    <header className={challengeHeroClasses.wrapper}>
      <div className={challengeHeroClasses.glow} />
      <div className={challengeHeroClasses.pillRow}>
        <span className={challengeHeroClasses.pill}>Official monthly run</span>
        <span className={challengeHeroClasses.pill}>{statusLabel}</span>
      </div>

      <h1 className={challengeHeroClasses.title}>{title}</h1>

      <p className={challengeHeroClasses.description}>
        {description ??
          "A focused daily challenge built for quick mobile check-ins, clear next steps, and steady momentum."}
      </p>

      {coverNote ? (
        <div className={challengeHeroClasses.note}>{coverNote}</div>
      ) : null}

      <div className={challengeHeroClasses.stats}>
        <div className={challengeHeroClasses.statCard}>
          <div className={challengeHeroClasses.statLabel}>Challenge window</div>
          <div className={challengeHeroClasses.statValue}>{rangeLabel}</div>
        </div>
        <div className={challengeHeroClasses.statCard}>
          <div className={challengeHeroClasses.statLabel}>Done on this device</div>
          <div className={challengeHeroClasses.statValue}>
            {localCompletedDays}/{totalDays}
          </div>
        </div>
      </div>
    </header>
  );
}
