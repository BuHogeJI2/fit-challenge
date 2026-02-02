export type TDayRow = {
  id: number;
  date: string;
  exercises: string | null;
  count: number | null;
  is_done: boolean | null;
};

export type TCalendarDay = {
  date: Date;
  dateKey: string;
  row?: TDayRow;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
  isDone: boolean;
  isLocked: boolean;
  status: string;
};
