import type { TChallengeDayView } from "../../lib/challenge";

export interface IDayDetailsSheetProps {
  open: boolean;
  day: TChallengeDayView | null;
  showPastActions?: boolean;
  completionActionLabel?: string;
  onOpenChange: (open: boolean) => void;
  onTrackSets?: () => void;
  onToggleComplete?: () => void;
}
