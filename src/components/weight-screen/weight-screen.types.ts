import type { TWeightEntry } from "../../lib/db";

export type TWeightView = "month" | "all";

export type TWeightSheetState =
  | { mode: "new" }
  | { mode: "edit"; entry: TWeightEntry }
  | null;
