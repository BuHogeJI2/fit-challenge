export const WEEKDAY_SHORT_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export type TRunStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "completed"
  | "archived";

export type TRunPhase = "before" | "during" | "after";

export type TDayState = "today" | "upcoming" | "elapsed" | "done_local";

export type TChallengeTemplate = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  durationDays: number;
  difficulty: string | null;
  coverNote: string | null;
  isPublished: boolean;
};

export type TChallengeRun = {
  id: number;
  templateId: number;
  slug: string;
  titleOverride: string | null;
  descriptionOverride: string | null;
  startsOn: string;
  endsOn: string;
  status: TRunStatus;
};

export type TDayExercise = {
  id: number;
  challengeDayId: number;
  position: number;
  exerciseName: string;
  targetReps: number | null;
  targetSeconds: number | null;
  restSeconds: number | null;
  notes: string | null;
  substitution: string | null;
};

export type TChallengeDay = {
  id: number;
  runId: number;
  dayNumber: number;
  date: string;
  title: string;
  summary: string | null;
  notes: string | null;
  estimatedMinutes: number | null;
  isRestDay: boolean;
  changeNote: string | null;
  updatedAt: string | null;
  exercises: TDayExercise[];
};

export type TFeaturedChallenge = {
  template: TChallengeTemplate | null;
  run: TChallengeRun;
  days: TChallengeDay[];
};

export type TLocalProgressEntry = {
  done: boolean;
  completedAt: string;
};

export type TLocalProgressMap = Record<string, TLocalProgressEntry>;

export type TToggleDayDoneOptions = {
  willMarkDone: boolean;
  triggerElement?: HTMLElement | null;
};

export type TChallengeDayView = TChallengeDay & {
  state: TDayState;
  isActionable: boolean;
  isUpdated: boolean;
  shortDateLabel: string;
  longDateLabel: string;
  relativeLabel: string;
};

export type TCalendarMonth = {
  key: string;
  label: string;
  offset: number;
  days: TChallengeDayView[];
};

export type TChallengeViewModel = {
  title: string;
  description: string | null;
  coverNote: string | null;
  runPhase: TRunPhase;
  statusLabel: string;
  progressLabel: string;
  rangeLabel: string;
  featuredDay: TChallengeDayView | null;
  nextDays: TChallengeDayView[];
  calendarMonths: TCalendarMonth[];
  scheduleCompletedDays: number;
  scheduleTotalDays: number;
  localCompletedDays: number;
  remainingDays: number;
  days: TChallengeDayView[];
};
