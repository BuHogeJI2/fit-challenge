import type { ReactNode } from "react";

export type TToast = {
  message: string;
  action?: {
    label: string;
    onAction: () => void | Promise<void>;
  };
  durationMs?: number;
};

export type TToastApi = {
  show: (toast: TToast) => void;
  dismiss: () => void;
  dismissActions: () => void;
};

export interface IToastProviderProps {
  children: ReactNode;
}
