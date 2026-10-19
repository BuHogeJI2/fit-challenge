import type { TBackupCounts, TBackupData } from "../../lib/backup";

export type TImportState =
  | { step: "idle" }
  | { step: "reading"; fileName: string }
  | { step: "errors"; fileName: string; errors: string[] }
  | {
      step: "preview";
      fileName: string;
      data: TBackupData;
      counts: TBackupCounts;
      exportedAt: string;
    };
