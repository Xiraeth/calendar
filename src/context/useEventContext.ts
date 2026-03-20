import { useContext } from "react";
import { EventContext, type EventContextType } from "./EventContext";

export function useEventContext(): EventContextType {
  const context = useContext(EventContext);
  if (context === null) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
}
