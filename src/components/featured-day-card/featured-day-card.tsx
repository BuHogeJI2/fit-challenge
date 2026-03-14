import { useRef } from "react";
import {
  formatExerciseNameForDisplay,
  formatFeaturedExerciseProgress,
  getFeaturedExerciseStatusLabel,
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
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const isDone = day.state === "done_local";
  const actionButtonClassName = isDone
    ? featuredDayCardClasses.completedButton
    : day.allExerciseGoalsReached
      ? featuredDayCardClasses.readyButton
      : featuredDayCardClasses.primaryButton;

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

      {day.hasLoggedProgress ? (
        <div className={featuredDayCardClasses.progressBanner}>
          <div className={featuredDayCardClasses.progressValue}>
            {day.dayLoggedRepsTotal}/{day.dayTargetRepsTotal} reps logged
          </div>
          <div className={featuredDayCardClasses.progressMeta}>
            Optional set tracking from day details.
          </div>
          {day.allExerciseGoalsReached && !isDone ? (
            <div className={featuredDayCardClasses.progressHint}>
              Targets reached. Mark the day done when you are ready.
            </div>
          ) : null}
        </div>
      ) : null}

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
              <div className={featuredDayCardClasses.itemHeading}>
                <div className={featuredDayCardClasses.itemName}>
                  {formatExerciseNameForDisplay(exercise.exerciseName)}
                </div>
                <span
                  aria-hidden="true"
                  className={featuredDayCardClasses.itemAccent}
                />
              </div>
              <div className={featuredDayCardClasses.itemMeta}>
                {getFeaturedExerciseStatusLabel(exercise)}
              </div>
            </div>
            <div
              className={
                exercise.isGoalReached && exercise.sets.length > 0
                  ? featuredDayCardClasses.itemTargetComplete
                  : featuredDayCardClasses.itemTarget
              }
            >
              {formatFeaturedExerciseProgress(exercise)}
            </div>
          </div>
        ))}
      </div>

      <div className={featuredDayCardClasses.actions}>
        {day.isActionable ? (
          <button
            ref={actionButtonRef}
            type="button"
            className={actionButtonClassName}
            onClick={() =>
              onToggleDayDone(day.dayNumber, {
                willMarkDone: !isDone,
                triggerElement: actionButtonRef.current,
              })
            }
          >
            {isDone ? "Undo completion" : "Mark done"}
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
        <button
          type="button"
          className={featuredDayCardClasses.secondaryButton}
          onClick={() => onOpenDay(day.id)}
        >
          Open day details
        </button>
      </div>
    </section>
  );
}
