const weightFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: false,
});

const repsFormatter = new Intl.NumberFormat("en-US");

const loadFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

const requireCount = (value: number) => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("Expected a nonnegative whole number.");
  }
};

export const parseDecimal = (value: string): number | null => {
  const trimmed = value.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(trimmed)) return null;

  const parsed = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed)) return null;
  return parsed === 0 ? 0 : parsed;
};

export const parseDuration = (text: string): number | null => {
  const trimmed = text.trim();
  const duration = /^(\d+):([0-5]\d)$/.exec(trimmed);
  if (duration) {
    const minutes = Number(duration[1]);
    const seconds = minutes * 60 + Number(duration[2]);
    return Number.isSafeInteger(seconds) ? seconds : null;
  }

  if (!/^\d+$/.test(trimmed)) return null;
  const seconds = Number(trimmed);
  return Number.isSafeInteger(seconds) ? seconds : null;
};

const roundTo = (value: number, factor: number) => {
  const rounded = Math.round(value * factor) / factor;
  return rounded === 0 ? 0 : rounded;
};

export const roundToTenth = (value: number) => roundTo(value, 10);

export const roundToHundredth = (value: number) => roundTo(value, 100);

export const formatWeightValue = (value: number): string => {
  if (!Number.isFinite(value)) throw new RangeError("Expected a finite weight.");
  const formatted = weightFormatter.format(value);
  return Number(formatted) === 0 ? "0.0" : formatted;
};

export const formatLoadValue = (value: number): string => {
  if (!Number.isFinite(value)) throw new RangeError("Expected a finite load.");
  const formatted = loadFormatter.format(value);
  return Number(formatted) === 0 ? "0" : formatted;
};

export const formatSignedWeightValue = (value: number): string => {
  const formatted = formatWeightValue(Math.abs(value));
  if (formatted === "0.0") return formatted;
  return `${value > 0 ? "+" : "\u2212"}${formatted}`;
};

export const formatKg = (value: number): string => `${formatWeightValue(value)} kg`;

export const formatReps = (value: number): string => {
  requireCount(value);
  return `${repsFormatter.format(value)} ${value === 1 ? "rep" : "reps"}`;
};

export const formatDuration = (seconds: number): string => {
  requireCount(seconds);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
