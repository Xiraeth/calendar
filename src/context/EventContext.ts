import { createContext } from "react";
import type { Event } from "../types";

export type EventContextType = {
  events: Event[];
  createEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
};

export const EventContext = createContext<EventContextType | null>(null);
