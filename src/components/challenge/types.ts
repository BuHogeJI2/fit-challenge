export type DayRow = {
  id: number;
  date: string;
  exercises: string | null;
  is_done: boolean | null;
};

export type CalendarDay = {
  date: Date;
  dateKey: string;
  row?: DayRow;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
  isDone: boolean;
  isLocked: boolean;
  status: string;
};
