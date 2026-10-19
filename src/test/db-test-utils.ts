import { db } from "../lib/db";

export const resetDatabase = async () => {
  await db.delete({ disableAutoOpen: false });
  await db.open();
};
