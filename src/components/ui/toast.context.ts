import { createContext, useContext } from "react";
import type { TToastApi } from "./toast.types";

export const ToastContext = createContext<TToastApi | null>(null);

export const useToast = () => {
  const api = useContext(ToastContext);
  if (!api) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return api;
};
