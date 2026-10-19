import type { TRepositoryErrorCode } from "./db.types";

export class RepositoryError extends Error {
  readonly code: TRepositoryErrorCode;

  constructor(code: TRepositoryErrorCode, message: string) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
  }
}

export const isRepositoryError = (
  error: unknown,
  code?: TRepositoryErrorCode,
): error is RepositoryError =>
  error instanceof RepositoryError && (code === undefined || error.code === code);
