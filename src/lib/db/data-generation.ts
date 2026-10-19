import { db } from "./db";
import { DATA_GENERATION_KEY } from "./db.types";

/**
 * Reads the data generation. A full restore or a wipe increases it, so an
 * undo captured before them can be refused.
 */
export const getDataGeneration = async () =>
  (await db.meta.get(DATA_GENERATION_KEY))?.value ?? 0;

/**
 * Increases the data generation. Call it inside the same transaction as the
 * restore or wipe, with `db.meta` in its scope, so a concurrent undo sees
 * either the old data and generation or the new ones.
 */
export const bumpDataGeneration = async () => {
  const current = await getDataGeneration();
  await db.meta.put({ key: DATA_GENERATION_KEY, value: current + 1 });
};
