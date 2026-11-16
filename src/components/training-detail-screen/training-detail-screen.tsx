import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "wouter";
import { appHref, useAppSearch, getAppPath, getReturnPath, rememberView, useRestoreView } from "../../lib/navigation";
import { formatDayHeading, useToday } from "../../lib/dates";
import { deleteSet, deleteTraining, getTraining, listExercises, listSets, restoreSet, restoreTraining, type TSet, type TTraining } from "../../lib/db";
import { formatSetValues, getTrainingExercises, getTrainingTitle } from "../../lib/stats";
import { SetEntrySheet, type TSetSheetState } from "../set-entry-sheet";
import { TrainingFormSheet } from "../training-form-sheet";
import { Button, useToast } from "../ui";
import { trainingDetailClasses as classes } from "./training-detail-screen.styles";
import { useSavedEntry } from "../../lib/motion";
import type { ITrainingDetailScreenProps } from "./training-detail-screen.types";

export function TrainingDetailScreen({ trainingId }: ITrainingDetailScreenProps) {
  const todayKey = useToday();
  const training = useLiveQuery(async () => (await getTraining(trainingId)) ?? null, [trainingId]);
  const sets = useLiveQuery(listSets, []);
  const exercises = useLiveQuery(listExercises, []);
  const [sheet, setSheet] = useState<TSetSheetState>(null);
  const [editing, setEditing] = useState(false);
  const [savedEntry, markSaved] = useSavedEntry();
  const toast = useToast();
  const [, navigate] = useLocation();
  const returnTo = getReturnPath(useAppSearch(), "/exercises");
  const selfHref = appHref(`/trainings/${trainingId}`, { from: returnTo });
  useRestoreView(getAppPath(), Boolean(training !== undefined && sets && exercises));
  if (training === undefined || !sets || !exercises) return null;
  if (training === null) return (
    <section className={classes.screen}>
      <Link className={classes.back} href="/exercises">Back to training</Link>
      <h1 className={classes.title}>Training not found</h1>
      <p className={classes.empty}>This training no longer exists on this device.</p>
    </section>
  );
  const entries = sets.filter((set) => set.trainingId === training.id);
  const groups = getTrainingExercises(entries, exercises);

  const removeEntry = async (set: TSet) => {
    const undo = await deleteSet(set.id);
    setSheet(null);
    if (!undo) return;
    if (undo.training) navigate(returnTo);
    toast.show({ message: "Entry deleted.", action: {
      label: "Undo", onAction: async () => {
        if (await restoreSet(undo)) {
          markSaved(undo.record.id);
          if (undo.training) navigate(selfHref);
        } else toast.show({ message: "Undo is no longer available." });
      },
    } });
  };

  const removeTraining = async (item: TTraining) => {
    const undo = await deleteTraining(item.id);
    if (!undo) return;
    setEditing(false);
    navigate(returnTo);
    toast.show({ message: "Training and its entries deleted.", action: {
      label: "Undo", onAction: async () => {
        if (await restoreTraining(undo)) navigate(selfHref);
        else toast.show({ message: "Undo is no longer available." });
      },
    } });
  };

  return (
    <section className={classes.screen}>
      <div className={classes.header}>
        <Link className={classes.back} href={returnTo} replace>Back to week</Link>
        <Button variant="quiet" onClick={() => setEditing(true)}>Edit training</Button>
      </div>
      <h1 className={classes.title}>{getTrainingTitle(training, sets, exercises)}</h1>
      <p className={classes.meta}>{formatDayHeading(training.date, todayKey)}</p>
      {training.note ? <p className={classes.note}>{training.note}</p> : null}
      {groups.length ? <ul className={classes.groups} aria-label="Training exercises">
        {groups.map((group) => (
          <li className={classes.group} key={group.exerciseId}>
            {group.exercise ? <Link className={classes.exercise} href={appHref(`/exercises/${group.exerciseId}`, { from: selfHref })} onClick={() => rememberView(selfHref)}>
              <h2 className={classes.name}>{group.exercise.name}</h2><span aria-hidden="true">›</span>
            </Link> : <h2 className={classes.name}>Unknown exercise</h2>}
            <p className={classes.meta}>{group.summary}{group.exercise?.archivedAt ? " · archived" : ""}</p>
            <ul className={classes.entries}>
              {group.sets.map((set) => (
                <li key={set.id} data-saved-row={savedEntry?.id === set.id ? savedEntry.phase : undefined}>
                  <button type="button" className={classes.entry} disabled={!group.exercise || Boolean(group.exercise.archivedAt)} aria-label={`Edit ${group.exercise?.name ?? "entry"}: ${group.exercise ? formatSetValues(group.exercise.metric, set) : "entry"}`} onClick={() => setSheet({ mode: "edit", set })}>
                    <span className={classes.values}>{group.exercise ? formatSetValues(group.exercise.metric, set) : "Entry kept"}</span>
                    {set.note ? <span className={classes.entryNote}>{set.note}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul> : <p className={classes.empty}>No entries in this training yet.</p>}
      <div className={classes.actions}>
        <Button disabled={!exercises.some((exercise) => !exercise.archivedAt)} onClick={() => setSheet({ mode: "new", trainingId: training.id })}>Add exercise</Button>
      </div>
      <SetEntrySheet state={sheet} exercises={exercises} sets={sets} todayKey={todayKey} onClose={() => setSheet(null)} onSaved={(saved) => {
        setSheet(null);
        markSaved(saved.id);
        if (saved.trainingId !== training.id) navigate(appHref(`/trainings/${saved.trainingId}`, { from: returnTo }));
        toast.show({ message: "Entry saved." });
      }} onDelete={removeEntry} />
      <TrainingFormSheet training={editing ? training : null} todayKey={todayKey} entryCount={entries.length} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); toast.show({ message: "Training saved." }); }} onDelete={removeTraining} />
    </section>
  );
}
