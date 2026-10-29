export const CHART_WIDTH = 342;
export const CHART_HEIGHT = 224;
export const PLOT_LEFT = 10;
export const PLOT_RIGHT = 302;
export const PLOT_TOP = 16;
export const PLOT_BOTTOM = 196;
export const AXIS_LABEL_Y = 216;
export const TICK_COUNT = 5;

export const getKeyboardSelection = (
  key: string,
  dates: readonly string[],
  selectedDate: string | null,
): string | null => {
  const step = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0;
  if (!step || !dates.length) return null;

  const index = selectedDate === null ? -1 : dates.indexOf(selectedDate);
  const nextIndex = index === -1 ? dates.length - 1 : Math.min(Math.max(index + step, 0), dates.length - 1);
  return dates[nextIndex];
};
