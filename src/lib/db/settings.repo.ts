import { db } from "./db";
import type { TSettingKey, TSettingRecord, TSettingValues } from "./db.types";
import { normalizeBodyWeightKg } from "./record-fields";

export const DEFAULT_SETTINGS: TSettingValues = {
  goalWeightKg: null,
  lastExportAt: null,
};

export const toSettingValues = (records: TSettingRecord[]): TSettingValues =>
  records.reduce<TSettingValues>(
    (values, record) => ({ ...values, [record.key]: record.value }),
    { ...DEFAULT_SETTINGS },
  );

export const getSettings = async () => toSettingValues(await db.settings.toArray());

const putSetting = <K extends TSettingKey>(key: K, value: TSettingValues[K]) =>
  db.settings.put({ key, value } as TSettingRecord);

export const setGoalWeight = async (goalWeightKg: number | null) => {
  await putSetting(
    "goalWeightKg",
    goalWeightKg === null ? null : normalizeBodyWeightKg(goalWeightKg, "Goal weight"),
  );
};

export const setLastExportAt = async (lastExportAt: string) => {
  await putSetting("lastExportAt", lastExportAt);
};
