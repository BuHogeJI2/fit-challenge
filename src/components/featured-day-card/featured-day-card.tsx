import { useRef } from "react";
import {
  formatExerciseNameForDisplay,
  formatFeaturedExerciseProgress,
  getFeaturedExerciseStatusLabel,
  getDayStateLabel,
  type TChallengeDayView,
} from "../../lib/challenge";
import { Badge, Button, Panel } from "../ui";
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
  onOpenExerciseTracker,
  onToggleDayDone,
}: IFeaturedDayCardProps) {
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const isDone = day.state === "done_local";
  const canTrackExercises = day.isActionable;
  const actionButtonClassName = isDone
    ? featuredDayCardClasses.completedButton
    : day.allExerciseGoalsReached
      ? featuredDayCardClasses.readyButton
      : featuredDayCardClasses.primaryButton;

  return (
    <section
      className={
        isDone
          ? featuredDayCardClasses.completedWrapper
          : featuredDayCardClasses.wrapper
      }
    >
      <div className={featuredDayCardClasses.labelRow}>
        <span
          className={
            isDone
              ? featuredDayCardClasses.completedPill
              : featuredDayCardClasses.pill
          }
        >
          {isDone ? "Day complete" : getEyebrowLabel(runPhase)}
        </span>
        <span className={featuredDayCardClasses.date}>
          {day.longDateLabel} • {getDayStateLabel(day.state)}
        </span>
      </div>

      <h2 className={featuredDayCardClasses.title}>{day.title}</h2>
      {isDone ? (
        <div className={featuredDayCardClasses.completedCallout}>
          Completed on this device. Reopen details if you want to review or adjust logged sets.
        </div>
      ) : null}
      <p className={featuredDayCardClasses.description}>
        {getDescription(day, runPhase)}
      </p>

      {day.hasLoggedProgress ? (
        <Panel className={featuredDayCardClasses.progressBanner} variant="surface">
          <div className={featuredDayCardClasses.progressValue}>
            {day.dayLoggedRepsTotal}/{day.dayTargetRepsTotal} reps logged
          </div>
          <div className={featuredDayCardClasses.progressMeta}>
            Exercise tracking now lives on the main card. Tap an exercise below
            to keep logging sets.
          </div>
          {day.allExerciseGoalsReached && !isDone ? (
            <div className={featuredDayCardClasses.progressHint}>
              Targets reached. Mark the day done when you are ready.
            </div>
          ) : null}
        </Panel>
      ) : null}

      <div className={featuredDayCardClasses.stats}>
        <Panel className={featuredDayCardClasses.statCard} variant="stat">
          <div className={featuredDayCardClasses.statLabel}>Daily target</div>
          <div className={featuredDayCardClasses.statValue}>
            {day.exercises.length} exercises
          </div>
        </Panel>
        <Panel className={featuredDayCardClasses.statCard} variant="stat">
          <div className={featuredDayCardClasses.statLabel}>Estimated time</div>
          <div className={featuredDayCardClasses.statValue}>
            {day.estimatedMinutes ? `${day.estimatedMinutes} min` : "Quick session"}
          </div>
        </Panel>
      </div>

      <div className={featuredDayCardClasses.list}>
        {day.exercises.map((exercise) => (
          canTrackExercises ? (
            <button
              key={exercise.id}
              type="button"
              className={
                exercise.isGoalReached && exercise.sets.length > 0
                  ? featuredDayCardClasses.itemButtonComplete
                  : featuredDayCardClasses.itemButton
              }
              onClick={() => onOpenExerciseTracker(exercise.id)}
              aria-label={`Track sets for ${formatExerciseNameForDisplay(exercise.exerciseName)}`}
            >
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
                <div className={featuredDayCardClasses.itemMetaRow}>
                  <div className={featuredDayCardClasses.itemMeta}>
                    {getFeaturedExerciseStatusLabel(exercise)}
                  </div>
                  <div className={featuredDayCardClasses.itemHint}>
                    Tap to track sets
                  </div>
                </div>
              </div>
              <div className={featuredDayCardClasses.itemAside}>
                <Badge
                  className={featuredDayCardClasses.itemTarget}
                  variant={
                    exercise.isGoalReached && exercise.sets.length > 0
                      ? "success"
                      : "info"
                  }
                >
                  {formatFeaturedExerciseProgress(exercise)}
                </Badge>
                <div className={featuredDayCardClasses.itemSetMeta}>
                  {exercise.sets.length
                    ? `${exercise.sets.length} set${exercise.sets.length === 1 ? "" : "s"}`
                    : "No sets yet"}
                </div>
              </div>
            </button>
          ) : (
            <Panel
              key={exercise.id}
              className={featuredDayCardClasses.itemPanel}
              variant="surface"
            >
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
                <div className={featuredDayCardClasses.itemMetaRow}>
                  <div className={featuredDayCardClasses.itemMeta}>
                    {getFeaturedExerciseStatusLabel(exercise)}
                  </div>
                  <div className={featuredDayCardClasses.itemHintPassive}>
                    Tracking unlocks on the day
                  </div>
                </div>
              </div>
              <div className={featuredDayCardClasses.itemAside}>
                <Badge
                  className={featuredDayCardClasses.itemTarget}
                  variant={
                    exercise.isGoalReached && exercise.sets.length > 0
                      ? "success"
                      : "info"
                  }
                >
                  {formatFeaturedExerciseProgress(exercise)}
                </Badge>
              </div>
            </Panel>
          )
        ))}
      </div>

      <div className={featuredDayCardClasses.actions}>
        {day.isActionable ? (
          <Button
            ref={actionButtonRef}
            className={actionButtonClassName}
            type="button"
            variant="secondary"
            onClick={() =>
              onToggleDayDone(day.dayNumber, {
                willMarkDone: !isDone,
                triggerElement: actionButtonRef.current,
              })
            }
          >
            {isDone ? "Undo completion" : "Mark done"}
          </Button>
        ) : (
          <Button
            className={featuredDayCardClasses.disabledButton}
            disabled
            type="button"
            variant="secondary"
          >
            Available on the day
          </Button>
        )}
        <Button
          className={featuredDayCardClasses.secondaryButton}
          type="button"
          variant="secondary"
          onClick={() => onOpenDay(day.id)}
        >
          Open day details
        </Button>
      </div>
    </section>
  );
}
