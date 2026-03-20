import { useContext } from "react";
import { ToastContext, type ToastContextType } from "./toastContextValue";

export function useToastContext(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
