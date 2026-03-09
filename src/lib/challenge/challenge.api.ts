import { supabase } from "../supabaseClient";
import type {
  TChallengeDay,
  TChallengeRun,
  TChallengeTemplate,
  TDayExercise,
  TFeaturedChallenge,
  TRunStatus,
} from "./challenge.types";
import { getDateKey, pickFeaturedRun } from "./challenge.utils";

type TRunRow = {
  id: number;
  template_id: number;
  slug: string;
  title_override: string | null;
  description_override: string | null;
  starts_on: string;
  ends_on: string;
  status: TRunStatus;
};

type TTemplateRow = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  duration_days: number;
  difficulty: string | null;
  cover_note: string | null;
  is_published: boolean;
};

type TDayRow = {
  id: number;
  run_id: number;
  day_number: number;
  date: string;
  title: string;
  summary: string | null;
  notes: string | null;
  estimated_minutes: number | null;
  is_rest_day: boolean;
  change_note: string | null;
  updated_at: string | null;
};

type TExerciseRow = {
  id: number;
  challenge_day_id: number;
  position: number;
  exercise_name: string;
  target_reps: number | null;
  target_seconds: number | null;
  rest_seconds: number | null;
  notes: string | null;
  substitution: string | null;
};

const normalizeRun = (row: TRunRow): TChallengeRun => ({
  id: row.id,
  templateId: row.template_id,
  slug: row.slug,
  titleOverride: row.title_override,
  descriptionOverride: row.description_override,
  startsOn: row.starts_on,
  endsOn: row.ends_on,
  status: row.status,
});

const normalizeTemplate = (row: TTemplateRow): TChallengeTemplate => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description,
  durationDays: row.duration_days,
  difficulty: row.difficulty,
  coverNote: row.cover_note,
  isPublished: row.is_published,
});

const normalizeExercise = (row: TExerciseRow): TDayExercise => ({
  id: row.id,
  challengeDayId: row.challenge_day_id,
  position: row.position,
  exerciseName: row.exercise_name,
  targetReps: row.target_reps,
  targetSeconds: row.target_seconds,
  restSeconds: row.rest_seconds,
  notes: row.notes,
  substitution: row.substitution,
});

const normalizeDay = (row: TDayRow, exercises: TDayExercise[]): TChallengeDay => ({
  id: row.id,
  runId: row.run_id,
  dayNumber: row.day_number,
  date: row.date,
  title: row.title,
  summary: row.summary,
  notes: row.notes,
  estimatedMinutes: row.estimated_minutes,
  isRestDay: row.is_rest_day,
  changeNote: row.change_note,
  updatedAt: row.updated_at,
  exercises,
});

export const fetchFeaturedChallenge = async (
  now = new Date(),
): Promise<TFeaturedChallenge | null> => {
  const { data: runRows, error: runError } = await supabase
    .from("challenge_runs")
    .select(
      "id,template_id,slug,title_override,description_override,starts_on,ends_on,status",
    )
    .in("status", ["scheduled", "active", "completed"])
    .order("starts_on", { ascending: true });

  if (runError) {
    throw new Error(runError.message);
  }

  const runs = (runRows ?? []).map((row) => normalizeRun(row as TRunRow));
  const featuredRun = pickFeaturedRun(runs, getDateKey(now));

  if (!featuredRun) {
    return null;
  }

  const [{ data: templateRow, error: templateError }, { data: dayRows, error: dayError }] =
    await Promise.all([
      supabase
        .from("challenge_templates")
        .select(
          "id,slug,title,description,duration_days,difficulty,cover_note,is_published",
        )
        .eq("id", featuredRun.templateId)
        .maybeSingle(),
      supabase
        .from("challenge_days")
        .select(
          "id,run_id,day_number,date,title,summary,notes,estimated_minutes,is_rest_day,change_note,updated_at",
        )
        .eq("run_id", featuredRun.id)
        .order("day_number", { ascending: true }),
    ]);

  if (templateError) {
    throw new Error(templateError.message);
  }

  if (dayError) {
    throw new Error(dayError.message);
  }

  const normalizedDayRows = (dayRows ?? []) as TDayRow[];
  const dayIds = normalizedDayRows.map((day) => day.id);

  const { data: exerciseRows, error: exerciseError } = dayIds.length
    ? await supabase
        .from("day_exercises")
        .select(
          "id,challenge_day_id,position,exercise_name,target_reps,target_seconds,rest_seconds,notes,substitution",
        )
        .in("challenge_day_id", dayIds)
        .order("challenge_day_id", { ascending: true })
        .order("position", { ascending: true })
    : { data: [], error: null };

  if (exerciseError) {
    throw new Error(exerciseError.message);
  }

  const exercisesByDayId = new Map<number, TDayExercise[]>();

  for (const exerciseRow of (exerciseRows ?? []) as TExerciseRow[]) {
    const normalizedExercise = normalizeExercise(exerciseRow);
    const existing = exercisesByDayId.get(normalizedExercise.challengeDayId) ?? [];
    existing.push(normalizedExercise);
    exercisesByDayId.set(normalizedExercise.challengeDayId, existing);
  }

  return {
    template: templateRow ? normalizeTemplate(templateRow as TTemplateRow) : null,
    run: featuredRun,
    days: normalizedDayRows.map((dayRow) =>
      normalizeDay(dayRow, exercisesByDayId.get(dayRow.id) ?? []),
    ),
  };
};
