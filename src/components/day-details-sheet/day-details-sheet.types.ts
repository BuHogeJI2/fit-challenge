import type { TChallengeDayView } from "../../lib/challenge";

export interface IDayDetailsSheetProps {
  open: boolean;
  day: TChallengeDayView | null;
  onOpenChange: (open: boolean) => void;
  onToggleDayDone: (dayNumber: number) => void;
}
