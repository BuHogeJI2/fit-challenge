import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  exportData,
  getBackupFileName,
  parseBackup,
  restoreBackup,
  serializeBackup,
  wipeAllData,
} from "../../lib/backup";
import { formatDateInContext, formatRelativeDate, getDateKey, useToday } from "../../lib/dates";
import { getSettings, isRepositoryError, setGoalWeight, setLastExportAt } from "../../lib/db";
import { formatWeightValue, parseDecimal } from "../../lib/numbers";
import { getPersistenceStatus, requestPersistence, type TPersistenceStatus } from "../../lib/storage";
import { Button, Field, useToast } from "../ui";
import { settingsScreenClasses as classes } from "./settings-screen.styles";
import type { TImportState } from "./settings-screen.types";
import { downloadTextFile } from "./settings-screen.utils";

const PERSISTENCE_TEXT: Record<TPersistenceStatus, string> = {
  persisted: "This browser has promised to keep the data until you delete it.",
  not_persisted:
    "This browser may clear the data when it runs low on space. Ask it to keep the data, and export backups.",
  unsupported: "This browser does not report whether it keeps the data. Export backups.",
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function SettingsScreen() {
  const todayKey = useToday();
  const settings = useLiveQuery(getSettings, []);
  const toast = useToast();
  const fileInputId = useId();
  const [goalText, setGoalText] = useState<string | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [importState, setImportState] = useState<TImportState>({ step: "idle" });
  const [isConfirmingWipe, setIsConfirmingWipe] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [persistence, setPersistence] = useState<TPersistenceStatus | null>(null);
  const importRequest = useRef(0);

  useEffect(
    () => () => {
      importRequest.current += 1;
    },
    [],
  );

  useEffect(() => {
    let isActive = true;
    getPersistenceStatus()
      .then((status) => {
        if (isActive) setPersistence(status);
      })
      .catch(() => {
        if (isActive) setPersistence("unsupported");
      });
    return () => {
      isActive = false;
    };
  }, []);

  if (!settings) {
    return null;
  }

  const goalValue =
    goalText ?? (settings.goalWeightKg === null ? "" : formatWeightValue(settings.goalWeightKg));

  const runBusy = async (action: () => Promise<void>, failure: string) => {
    setIsBusy(true);
    try {
      await action();
    } catch (error) {
      toast.show({ message: isRepositoryError(error) ? error.message : failure });
    } finally {
      setIsBusy(false);
    }
  };

  const handleExport = () =>
    runBusy(async () => {
      const fileName = getBackupFileName(todayKey);
      downloadTextFile(fileName, serializeBackup(await exportData()));
      await setLastExportAt(new Date().toISOString());
      toast.show({ message: `Saved ${fileName}.` });
    }, "Could not export. Nothing was changed.");

  const handleGoalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = goalValue.trim();
    const goalWeightKg = trimmed ? parseDecimal(trimmed) : null;

    if (trimmed && (goalWeightKg === null || goalWeightKg <= 0)) {
      setGoalError("Enter a weight like 80 or 79.5, or leave it empty.");
      return;
    }

    setGoalError(null);
    await runBusy(async () => {
      await setGoalWeight(goalWeightKg);
      setGoalText(null);
      toast.show({ message: goalWeightKg === null ? "Goal cleared." : "Goal saved." });
    }, "Could not save the goal. Nothing was changed.");
  };

  const cancelImport = () => {
    importRequest.current += 1;
    setImportState({ step: "idle" });
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Only the latest selection may publish its result; an older file that
    // finishes reading later must not replace the preview the person sees.
    importRequest.current += 1;
    const request = importRequest.current;
    setImportState({ step: "reading", fileName: file.name });

    try {
      const result = parseBackup(await file.text());
      if (request !== importRequest.current) return;
      setImportState(
        result.ok
          ? {
              step: "preview",
              fileName: file.name,
              data: result.data,
              counts: result.counts,
              exportedAt: result.exportedAt,
            }
          : { step: "errors", fileName: file.name, errors: result.errors },
      );
    } catch {
      if (request !== importRequest.current) return;
      setImportState({ step: "errors", fileName: file.name, errors: ["The file could not be read."] });
    }
  };

  const handleRestore = () => {
    if (importState.step !== "preview") return;
    const { data } = importState;
    importRequest.current += 1;

    return runBusy(async () => {
      await restoreBackup(data);
      setImportState({ step: "idle" });
      toast.show({ message: "Backup restored." });
    }, "Could not restore. Your current data was not changed.");
  };

  const handleWipe = () =>
    runBusy(async () => {
      await wipeAllData();
      setIsConfirmingWipe(false);
      toast.show({ message: "All data deleted from this device." });
    }, "Could not delete. Nothing was changed.");

  const handleRequestPersistence = () =>
    runBusy(async () => {
      setPersistence(await requestPersistence());
    }, "The browser did not answer. Nothing was changed.");

  const lastExport = settings.lastExportAt
    ? formatRelativeDate(getDateKey(new Date(settings.lastExportAt)), todayKey)
    : null;

  return (
    <section className={classes.screen}>
      <h1 className={classes.title}>Settings</h1>

      <section className={classes.section} aria-labelledby="settings-goal">
        <h2 id="settings-goal" className={classes.heading}>
          Goal
        </h2>
        <form className={classes.goalForm} onSubmit={handleGoalSubmit} noValidate>
          <Field
            label="Goal weight, kg"
            inputMode="decimal"
            autoComplete="off"
            placeholder="80.0"
            value={goalValue}
            error={goalError}
            hint="Shown as a line on the weight chart. Leave empty for no goal."
            onChange={(event) => setGoalText(event.target.value)}
          />
          <Button type="submit" size="sm" variant="outline" disabled={isBusy}>
            Save goal
          </Button>
        </form>
      </section>

      <section className={classes.section} aria-labelledby="settings-backup">
        <h2 id="settings-backup" className={classes.heading}>
          Backup
        </h2>
        <p className={classes.text}>
          Your data lives only in this browser. Export a backup file now and then, and keep
          it somewhere safe.
        </p>
        <p className={classes.meta}>
          {lastExport ? `Last export: ${lastExport}` : "No backup exported yet"}
        </p>
        <div className={classes.buttons}>
          <Button onClick={() => void handleExport()} disabled={isBusy}>
            Export backup
          </Button>
          <label htmlFor={fileInputId} className={classes.fileLabel}>
            Restore from a file
          </label>
          <input
            id={fileInputId}
            type="file"
            accept="application/json,.json"
            className={classes.fileInput}
            onChange={(event) => void handleFile(event)}
          />
        </div>

        {importState.step === "errors" ? (
          <div className={classes.panel} role="alert">
            <p className={classes.panelTitle}>{importState.fileName} cannot be restored</p>
            <ul className={classes.errors}>
              {importState.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <p className={classes.text}>Nothing was changed.</p>
            <Button variant="quiet" onClick={cancelImport}>
              Close
            </Button>
          </div>
        ) : null}

        {importState.step === "reading" ? (
          <div className={classes.panel} role="status">
            <p className={classes.panelTitle}>Checking {importState.fileName}…</p>
          </div>
        ) : null}

        {importState.step === "preview" ? (
          <div className={classes.panel} aria-label="Restore preview" role="region">
            <p className={classes.panelTitle}>{importState.fileName}</p>
            <p className={classes.meta}>
              Exported {formatDateInContext(getDateKey(new Date(importState.exportedAt)), todayKey)}
            </p>
            <p className={classes.text}>
              {plural(importState.counts.weightEntries, "weigh-in")},{" "}
              {plural(importState.counts.exercises, "exercise")},{" "}
              {plural(importState.counts.sets, "set")},{" "}
              {plural(importState.counts.settings, "setting")}.
            </p>
            <p className={classes.warning}>
              Restoring replaces everything on this device with this file.
            </p>
            <div className={classes.buttons}>
              <Button variant="outline" onClick={() => void handleExport()} disabled={isBusy}>
                Export current data first
              </Button>
              <Button onClick={() => void handleRestore()} disabled={isBusy}>
                Replace my data
              </Button>
              <Button variant="quiet" onClick={cancelImport}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className={classes.section} aria-labelledby="settings-storage">
        <h2 id="settings-storage" className={classes.heading}>
          Storage
        </h2>
        <p className={classes.text}>
          {persistence ? PERSISTENCE_TEXT[persistence] : "Checking…"}
        </p>
        {persistence === "not_persisted" ? (
          <Button size="sm" variant="outline" onClick={() => void handleRequestPersistence()} disabled={isBusy}>
            Ask to keep data
          </Button>
        ) : null}
      </section>

      <section className={classes.section} aria-labelledby="settings-delete">
        <h2 id="settings-delete" className={classes.heading}>
          Delete data
        </h2>
        {isConfirmingWipe ? (
          <div className={classes.panel} role="region" aria-label="Confirm delete">
            <p className={classes.warning}>
              This deletes every weigh-in, exercise, set and setting on this device. It
              cannot be undone without a backup file.
            </p>
            <div className={classes.buttons}>
              <Button onClick={() => void handleWipe()} disabled={isBusy}>
                Delete everything
              </Button>
              <Button variant="quiet" onClick={() => setIsConfirmingWipe(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="text" onClick={() => setIsConfirmingWipe(true)}>
            Delete all data
          </Button>
        )}
      </section>
    </section>
  );
}
