import type { TWeightEntry } from "../../lib/db";

export type TWeightView = "month" | "weeks" | "all" | "week";

export type TWeightSheetState =
  | { mode: "new" }
  | { mode: "edit"; entry: TWeightEntry }
  | null;
