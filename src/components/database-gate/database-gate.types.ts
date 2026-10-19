import type { ReactNode } from "react";

export type TDatabaseStatus =
  | { state: "opening" }
  | { state: "ready" }
  | { state: "failed"; message: string };

export interface IDatabaseGateProps {
  children: ReactNode;
}

export interface IStorageErrorProps {
  message: string;
}

export interface IStorageErrorBoundaryState {
  message: string | null;
}
