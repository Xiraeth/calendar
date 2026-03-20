import { createContext } from "react";

export type ToastContextType = {
  showSuccessToast: (message: string) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);
