import {
  formatExerciseTarget,
  getDayStateLabel,
  type TChallengeDayView,
} from "../../lib/challenge";
import { featuredDayCardClasses } from "./featured-day-card.styles";
import type { IFeaturedDayCardProps } from "./featured-day-card.types";

const getEyebrowLabel = (runPhase: IFeaturedDayCardProps["runPhase"]) => {
  switch (runPhase) {
    case "before":
      return "Day 1 preview";
    case "after":
      return "Final day recap";
    default:
      return "Today's focus";
  }
};

const getDescription = (day: TChallengeDayView, runPhase: IFeaturedDayCardProps["runPhase"]) => {
  if (runPhase === "before") {
    return "The challenge has not started yet. Review the opening session and get set up now.";
  }

  if (runPhase === "after") {
    return "The run is complete. Use the final day as a recap of how the challenge closed.";
  }

  return (
    day.summary ??
    "Stay consistent today. Split the work into clean sets and keep the session moving."
  );
};

export function FeaturedDayCard({
  day,
  runPhase,
  onOpenDay,
  onToggleDayDone,
}: IFeaturedDayCardProps) {
  return (
    <section className={featuredDayCardClasses.wrapper}>
      <div className={featuredDayCardClasses.labelRow}>
        <span className={featuredDayCardClasses.pill}>{getEyebrowLabel(runPhase)}</span>
        <span className={featuredDayCardClasses.date}>
          {day.longDateLabel} • {getDayStateLabel(day.state)}
        </span>
      </div>

      <h2 className={featuredDayCardClasses.title}>{day.title}</h2>
      <p className={featuredDayCardClasses.description}>
        {getDescription(day, runPhase)}
      </p>

      <div className={featuredDayCardClasses.stats}>
        <div className={featuredDayCardClasses.statCard}>
          <div className={featuredDayCardClasses.statLabel}>Daily target</div>
          <div className={featuredDayCardClasses.statValue}>
            {day.exercises.length} exercises
          </div>
        </div>
        <div className={featuredDayCardClasses.statCard}>
          <div className={featuredDayCardClasses.statLabel}>Estimated time</div>
          <div className={featuredDayCardClasses.statValue}>
            {day.estimatedMinutes ? `${day.estimatedMinutes} min` : "Quick session"}
          </div>
        </div>
      </div>

      <div className={featuredDayCardClasses.list}>
        {day.exercises.map((exercise) => (
          <div key={exercise.id} className={featuredDayCardClasses.item}>
            <div className={featuredDayCardClasses.itemMain}>
              <div className={featuredDayCardClasses.itemNameBadge}>
                {exercise.exerciseName}
              </div>
              <div className={featuredDayCardClasses.itemMeta}>
                Daily target
              </div>
            </div>
            <div className={featuredDayCardClasses.itemTarget}>
              {formatExerciseTarget(exercise)}
            </div>
          </div>
        ))}
      </div>

      <div className={featuredDayCardClasses.actions}>
        <button
          type="button"
          className={featuredDayCardClasses.primaryButton}
          onClick={() => onOpenDay(day.id)}
        >
          Open day details
        </button>
        {day.isActionable ? (
          <button
            type="button"
            className={featuredDayCardClasses.secondaryButton}
            onClick={() => onToggleDayDone(day.dayNumber)}
          >
            {day.state === "done_local" ? "Undo completion" : "Mark done"}
          </button>
        ) : (
          <button
            type="button"
            className={featuredDayCardClasses.disabledButton}
            disabled
          >
            Available on the day
          </button>
        )}
      </div>
    </section>
  );
}
