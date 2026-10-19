export type TPersistenceStatus = "persisted" | "not_persisted" | "unsupported";

const getStorageManager = () =>
  typeof navigator !== "undefined" && navigator.storage ? navigator.storage : null;

/**
 * Reports whether the browser promised to keep this site's data when it runs
 * low on space.
 */
export const getPersistenceStatus = async (): Promise<TPersistenceStatus> => {
  const storage = getStorageManager();
  if (!storage?.persisted) {
    return "unsupported";
  }
  return (await storage.persisted()) ? "persisted" : "not_persisted";
};

/**
 * Asks the browser to keep this site's data. Returns the resulting status;
 * the browser may refuse without asking the person.
 */
export const requestPersistence = async (): Promise<TPersistenceStatus> => {
  const storage = getStorageManager();
  if (!storage?.persist) {
    return "unsupported";
  }
  return (await storage.persist()) ? "persisted" : "not_persisted";
};
