export interface ICurrentDayCardProps {
  label: string;
  dateLabel: string;
  title: string;
  description: string;
  exercises: string[];
  count?: number | null;
  emptyMessage: string;
}
