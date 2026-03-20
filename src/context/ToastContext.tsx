import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ToastContext, type ToastContextType } from "./toastContextValue";

type ToastItem = {
  id: string;
  message: string;
};

type ToastProviderProps = {
  children: ReactNode;
};

const TOAST_DURATION_MS = 5000;

const generateToastId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showSuccessToast = useCallback((message: string) => {
    const id = generateToastId();
    setToasts((previousToasts) => [...previousToasts, { id, message }]);
    setTimeout(() => {
      setToasts((previousToasts) =>
        previousToasts.filter((toast) => toast.id !== id),
      );
    }, TOAST_DURATION_MS);
  }, []);

  const value = useMemo<ToastContextType>(
    () => ({
      showSuccessToast,
    }),
    [showSuccessToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[200] w-full max-w-md -translate-x-1/2 space-y-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-md"
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
