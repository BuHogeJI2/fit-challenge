import type { TTraining } from "../../lib/db";

export interface ITrainingFormSheetProps {
  training: TTraining | null;
  todayKey: string;
  entryCount: number;
  onClose: () => void;
  onSaved: (training: TTraining) => void;
  onDelete: (training: TTraining) => Promise<void>;
}
