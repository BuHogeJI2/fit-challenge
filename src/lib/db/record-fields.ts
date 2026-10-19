import { parseDateKey } from "../dates";
import { roundToHundredth, roundToTenth } from "../numbers";
import { RepositoryError } from "./repository-error";

export const createId = () => crypto.randomUUID();

export const now = () => new Date().toISOString();

export const assertDateKey = (value: string) => {
  if (parseDateKey(value) === null) {
    throw new RepositoryError("invalid_input", `Invalid date: ${value}`);
  }
};

const assertPositiveNumber = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RepositoryError("invalid_input", `${label} must be a positive number.`);
  }
};

export const assertPositiveInteger = (value: number, label: string) => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RepositoryError("invalid_input", `${label} must be a positive whole number.`);
  }
};

export const normalizeBodyWeightKg = (value: number, label = "Weight") => {
  const rounded = roundToTenth(value);
  assertPositiveNumber(rounded, label);
  return rounded;
};

export const normalizeLoadKg = (value: number) => {
  const rounded = roundToHundredth(value);
  assertPositiveNumber(rounded, "Weight");
  return rounded;
};

export const normalizeNote = (note: string | null | undefined) => {
  const trimmed = note?.trim() ?? "";
  return trimmed ? trimmed : null;
};
