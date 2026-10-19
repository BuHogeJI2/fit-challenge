import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toastClasses } from "./toast.styles";
import { ToastContext } from "./toast.context";
import type { IToastProviderProps, TToast, TToastApi } from "./toast.types";

const DEFAULT_DURATION_MS = 6000;

export function ToastProvider({ children }: IToastProviderProps) {
  const [toast, setToast] = useState<(TToast & { id: number }) | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback(() => setToast(null), []);

  const dismissActions = useCallback(
    () => setToast((current) => (current?.action ? null : current)),
    [],
  );

  const show = useCallback((next: TToast) => {
    nextId.current += 1;
    setToast({ ...next, id: nextId.current });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(dismiss, toast.durationMs ?? DEFAULT_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [dismiss, toast]);

  const api = useMemo<TToastApi>(
    () => ({ show, dismiss, dismissActions }),
    [dismiss, dismissActions, show],
  );

  const handleAction = () => {
    const action = toast?.action;
    dismiss();
    if (!action) return;

    Promise.resolve()
      .then(action.onAction)
      .catch(() => show({ message: "Something went wrong. Nothing was changed." }));
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" className={toastClasses.region}>
        {toast ? (
          <div key={toast.id} className={toastClasses.toast}>
            <span className={toastClasses.message}>{toast.message}</span>
            {toast.action ? (
              <button type="button" className={toastClasses.action} onClick={handleAction}>
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
