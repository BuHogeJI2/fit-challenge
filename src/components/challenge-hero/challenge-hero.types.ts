export interface IChallengeHeroProps {
  title: string;
  description: string | null;
  rangeLabel: string;
  statusLabel: string;
  coverNote: string | null;
  localCompletedDays: number;
  totalDays: number;
}
