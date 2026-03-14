import type {
  TCalendarMonth,
  TChallengeDay,
  TChallengeDayExerciseView,
  TChallengeDayView,
  TChallengeRun,
  TChallengeViewModel,
  TDayExercise,
  TDayState,
  TFeaturedChallenge,
  TLocalProgressMap,
  TRunPhase,
  TRunStatus,
} from "./challenge.types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const RUN_STATUS_PRIORITY: Record<TRunStatus, number> = {
  active: 0,
  scheduled: 1,
  completed: 2,
  draft: 3,
  archived: 4,
};

export const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parseIsoDate(value));

export const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parseIsoDate(value));

export const formatRangeLabel = (start: string, end: string) =>
  `${formatShortDate(start)} - ${formatShortDate(end)}`;

export const getCompletionPercent = (completed: number, total: number) =>
  Math.min(Math.max(Math.round((completed / Math.max(total, 1)) * 100), 0), 100);

export const getDayStateLabel = (state: TDayState) => {
  switch (state) {
    case "today":
      return "Today";
    case "done_local":
      return "Done";
    case "missed":
      return "Missed";
    default:
      return "Upcoming";
  }
};

export const formatExerciseTarget = (exercise: TDayExercise) => {
  if (exercise.targetReps !== null) {
    return `${exercise.targetReps} reps`;
  }

  if (exercise.targetSeconds !== null) {
    return `${exercise.targetSeconds}s`;
  }

  return "Target to be defined";
};

export const formatFeaturedExerciseProgress = (
  exercise: Pick<
    TChallengeDayExerciseView,
    "loggedRepsTotal" | "targetReps" | "sets" | "targetSeconds"
  >,
) => {
  if (exercise.sets.length === 0) {
    if (exercise.targetReps !== null) {
      return `${exercise.targetReps} reps`;
    }

    if (exercise.targetSeconds !== null) {
      return `${exercise.targetSeconds}s`;
    }

    return "Target to be defined";
  }

  if (exercise.targetReps !== null) {
    return `${exercise.loggedRepsTotal} / ${exercise.targetReps}`;
  }

  if (exercise.targetSeconds !== null) {
    return `${exercise.targetSeconds}s`;
  }

  return "Target to be defined";
};

export const getFeaturedExerciseStatusLabel = (
  exercise: Pick<TChallengeDayExerciseView, "sets" | "isGoalReached">,
) => {
  if (exercise.sets.length === 0) {
    return "Daily target";
  }

  if (exercise.isGoalReached) {
    return "Goal reached";
  }

  return `${exercise.sets.length} set${exercise.sets.length === 1 ? "" : "s"} logged`;
};

export const formatExerciseNameForDisplay = (value: string) =>
  value
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((segment) =>
          segment ? `${segment.charAt(0).toUpperCase()}${segment.slice(1)}` : segment,
        )
        .join("-"),
    )
    .join(" ");

const getExerciseLoggedRepsTotal = (
  dayNumber: number,
  exerciseId: number,
  progressMap: TLocalProgressMap,
) =>
  (
    progressMap[String(dayNumber)]?.exerciseProgress?.[String(exerciseId)]?.sets ??
    []
  ).reduce((total, set) => total + set.reps, 0);

const getExerciseSets = (
  dayNumber: number,
  exerciseId: number,
  progressMap: TLocalProgressMap,
) =>
  progressMap[String(dayNumber)]?.exerciseProgress?.[String(exerciseId)]?.sets ?? [];

const compareDateKeys = (left: string, right: string) =>
  left.localeCompare(right);

const differenceInDays = (left: Date, right: Date) =>
  Math.round((left.getTime() - right.getTime()) / DAY_IN_MS);

const getRunPhase = (run: TChallengeRun, todayKey: string): TRunPhase => {
  if (compareDateKeys(todayKey, run.startsOn) < 0) {
    return "before";
  }

  if (compareDateKeys(todayKey, run.endsOn) > 0) {
    return "after";
  }

  return "during";
};

const getCountdownLabel = (todayKey: string, startsOn: string) => {
  const daysUntilStart = differenceInDays(
    parseIsoDate(startsOn),
    parseIsoDate(todayKey),
  );

  if (daysUntilStart <= 0) {
    return "Starts today";
  }

  if (daysUntilStart === 1) {
    return "Starts tomorrow";
  }

  return `Starts in ${daysUntilStart} days`;
};

const getRunStatusLabel = (
  run: TChallengeRun,
  phase: TRunPhase,
  todayKey: string,
  totalDays: number,
  scheduleCompletedDays: number,
) => {
  if (phase === "before") {
    return getCountdownLabel(todayKey, run.startsOn);
  }

  if (phase === "after") {
    return run.status === "completed" ? "Run completed" : "Challenge complete";
  }

  return `Day ${Math.min(scheduleCompletedDays, totalDays)} of ${totalDays}`;
};

const getProgressLabel = (
  phase: TRunPhase,
  scheduleCompletedDays: number,
  totalDays: number,
) => {
  if (phase === "before") {
    return "The schedule has not started yet.";
  }

  if (phase === "after") {
    return "The official run has finished.";
  }

  return `${scheduleCompletedDays} of ${totalDays} calendar days have arrived.`;
};

const getScheduleCompletedDays = (
  phase: TRunPhase,
  run: TChallengeRun,
  totalDays: number,
  todayKey: string,
) => {
  if (phase === "before") return 0;
  if (phase === "after") return totalDays;

  const daysElapsed = differenceInDays(
    parseIsoDate(todayKey),
    parseIsoDate(run.startsOn),
  );
  return Math.min(Math.max(daysElapsed + 1, 1), totalDays);
};

const getRelativeLabel = (
  day: TChallengeDay,
  todayKey: string,
  phase: TRunPhase,
  featuredDayNumber: number | null,
) => {
  if (phase === "during") {
    const diff = differenceInDays(parseIsoDate(day.date), parseIsoDate(todayKey));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff > 1) return `In ${diff} days`;
  }

  if (phase === "before" && featuredDayNumber !== null) {
    const offset = day.dayNumber - featuredDayNumber;
    if (offset === 0) return "Opening day";
    return `Day ${day.dayNumber}`;
  }

  return `Day ${day.dayNumber}`;
};

const groupDaysIntoMonths = (days: TChallengeDayView[]): TCalendarMonth[] => {
  const months = new Map<string, TCalendarMonth>();

  for (const day of days) {
    const date = parseIsoDate(day.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    if (!months.has(key)) {
      months.set(key, {
        key,
        label: new Intl.DateTimeFormat("en-US", {
          month: "long",
          year: "numeric",
        }).format(date),
        offset: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
        days: [],
      });
    }

    months.get(key)!.days.push(day);
  }

  return Array.from(months.values());
};

export const pickFeaturedRun = (
  runs: TChallengeRun[],
  todayKey: string,
): TChallengeRun | null => {
  if (!runs.length) return null;

  const orderedRuns = [...runs].sort((left, right) => {
    const leftPhase = getRunPhase(left, todayKey);
    const rightPhase = getRunPhase(right, todayKey);

    const phasePriority = { during: 0, before: 1, after: 2 } as const;
    if (phasePriority[leftPhase] !== phasePriority[rightPhase]) {
      return phasePriority[leftPhase] - phasePriority[rightPhase];
    }

    if (leftPhase === "during") {
      return RUN_STATUS_PRIORITY[left.status] - RUN_STATUS_PRIORITY[right.status];
    }

    if (leftPhase === "before") {
      return compareDateKeys(left.startsOn, right.startsOn);
    }

    return compareDateKeys(right.endsOn, left.endsOn);
  });

  return orderedRuns[0] ?? null;
};

export const buildChallengeViewModel = (
  challenge: TFeaturedChallenge | null,
  progressMap: TLocalProgressMap,
  today = new Date(),
): TChallengeViewModel | null => {
  if (!challenge) return null;

  const sortedDays = [...challenge.days].sort((left, right) => left.dayNumber - right.dayNumber);
  const todayKey = getDateKey(today);
  const runPhase = getRunPhase(challenge.run, todayKey);
  const scheduleTotalDays = sortedDays.length;
  const localCompletedDays = Object.values(progressMap).filter(
    (entry) => entry.done,
  ).length;
  const scheduleCompletedDays = getScheduleCompletedDays(
    runPhase,
    challenge.run,
    scheduleTotalDays,
    todayKey,
  );

  const featuredDayBase =
    runPhase === "before"
      ? sortedDays[0] ?? null
      : runPhase === "after"
        ? sortedDays[sortedDays.length - 1] ?? null
        : sortedDays.find((day) => day.date === todayKey) ?? sortedDays[0] ?? null;

  const featuredDayNumber = featuredDayBase?.dayNumber ?? null;

  const days = sortedDays.map<TChallengeDayView>((day) => {
    const isDoneLocal = Boolean(progressMap[String(day.dayNumber)]?.done);

    let state: TDayState;
    if (isDoneLocal) {
      state = "done_local";
    } else if (day.date === todayKey) {
      state = "today";
    } else if (compareDateKeys(day.date, todayKey) > 0) {
      state = "upcoming";
    } else {
      state = "missed";
    }

    const exercises = day.exercises.map<TChallengeDayExerciseView>((exercise) => {
      const loggedRepsTotal = getExerciseLoggedRepsTotal(
        day.dayNumber,
        exercise.id,
        progressMap,
      );
      const targetReps = exercise.targetReps ?? 0;
      const remainingReps = Math.max(targetReps - loggedRepsTotal, 0);
      const progressPercent =
        targetReps > 0 ? getCompletionPercent(loggedRepsTotal, targetReps) : 0;
      const sets = getExerciseSets(day.dayNumber, exercise.id, progressMap);

      return {
        ...exercise,
        loggedRepsTotal,
        remainingReps,
        isGoalReached: targetReps > 0 && loggedRepsTotal >= targetReps,
        progressPercent,
        sets,
      };
    });
    const dayLoggedRepsTotal = exercises.reduce(
      (total, exercise) => total + exercise.loggedRepsTotal,
      0,
    );
    const dayTargetRepsTotal = exercises.reduce(
      (total, exercise) => total + (exercise.targetReps ?? 0),
      0,
    );
    const hasLoggedProgress = exercises.some((exercise) => exercise.sets.length > 0);
    const allExerciseGoalsReached =
      exercises.length > 0 &&
      exercises.every((exercise) =>
        exercise.targetReps !== null ? exercise.isGoalReached : false,
      );

    return {
      ...day,
      exercises,
      state,
      isActionable: state === "today" || state === "missed" || state === "done_local",
      isUpdated: Boolean(day.changeNote),
      shortDateLabel: formatShortDate(day.date),
      longDateLabel: formatLongDate(day.date),
      relativeLabel: getRelativeLabel(day, todayKey, runPhase, featuredDayNumber),
      dayLoggedRepsTotal,
      dayTargetRepsTotal,
      allExerciseGoalsReached,
      hasLoggedProgress,
    };
  });

  const featuredDay = featuredDayBase
    ? days.find((day) => day.id === featuredDayBase.id) ?? null
    : null;

  const nextDays = days
    .filter((day) => featuredDay && day.dayNumber > featuredDay.dayNumber)
    .filter((day) => {
      if (runPhase === "after") return false;
      return day.state === "upcoming";
    })
    .slice(0, 3);

  const rangeLabel = formatRangeLabel(
    challenge.run.startsOn,
    challenge.run.endsOn,
  );

  return {
    title: challenge.run.titleOverride ?? challenge.template?.title ?? "Featured challenge",
    description:
      challenge.run.descriptionOverride ??
      challenge.template?.description ??
      null,
    coverNote: challenge.template?.coverNote ?? null,
    runPhase,
    statusLabel: getRunStatusLabel(
      challenge.run,
      runPhase,
      todayKey,
      scheduleTotalDays,
      scheduleCompletedDays,
    ),
    progressLabel: getProgressLabel(
      runPhase,
      scheduleCompletedDays,
      scheduleTotalDays,
    ),
    rangeLabel,
    featuredDay,
    nextDays,
    calendarMonths: groupDaysIntoMonths(days),
    scheduleCompletedDays,
    scheduleTotalDays,
    localCompletedDays,
    remainingDays: Math.max(scheduleTotalDays - scheduleCompletedDays, 0),
    days,
  };
};
