import { db } from "../lib/db";
import { clearNavigationMemory } from "../lib/navigation";

export const resetDatabase = async () => {
  clearNavigationMemory();
  await db.delete({ disableAutoOpen: false });
  await db.open();
};
