import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { Event } from "../types";
import { EventContext, type EventContextType } from "./EventContext";
import { useToastContext } from "./useToastContext";

type EventProviderProps = {
  children: ReactNode;
};

const generateEventId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `event-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const persistEvents = (events: Event[]): void => {
  localStorage.setItem("calendar-events", JSON.stringify(events));
};

export default function EventProvider({ children }: EventProviderProps) {
  const { showSuccessToast } = useToastContext();
  const [events, setEvents] = useState<Event[]>(() => {
    const raw = localStorage.getItem("calendar-events");
    if (raw === null) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const next: Event[] = [];
      for (const item of parsed) {
        if (typeof item !== "object" || item === null) {
          continue;
        }
        const candidate = item as Partial<Event>;
        if (
          typeof candidate.name !== "string" ||
          typeof candidate.date !== "string" ||
          typeof candidate.time !== "string" ||
          typeof candidate.duration !== "number" ||
          (candidate.type !== "EVENT" &&
            candidate.type !== "APPOINTMENT" &&
            candidate.type !== "TASK")
        ) {
          continue;
        }
        next.push({
          id: typeof candidate.id === "string" ? candidate.id : generateEventId(),
          name: candidate.name,
          date: candidate.date,
          time: candidate.time,
          duration: candidate.duration,
          type: candidate.type,
          ...(typeof candidate.description === "string"
            ? { description: candidate.description }
            : {}),
          ...(typeof candidate.location === "string"
            ? { location: candidate.location }
            : {}),
          ...(typeof candidate.notes === "string"
            ? { notes: candidate.notes }
            : {}),
          ...(Array.isArray(candidate.people) &&
          candidate.people.every((person) => typeof person === "string")
            ? { people: candidate.people }
            : {}),
        });
      }
      return next;
    } catch {
      return [];
    }
  });
  const createEvent = useCallback((event: Event) => {
    const eventName = event.name.trim();
    setEvents((previousEvents) => {
      const nextEvents = [
        ...previousEvents,
        {
          ...event,
          id: typeof event.id === "string" ? event.id : generateEventId(),
        },
      ];
      persistEvents(nextEvents);
      return nextEvents;
    });
    showSuccessToast(
      eventName.length > 0
        ? `Event "${eventName}" created successfully`
        : "Event created successfully",
    );
  }, [showSuccessToast]);

  const updateEvent = useCallback((event: Event) => {
    if (typeof event.id !== "string") {
      return;
    }
    const shouldUpdate = events.some((currentEvent) => currentEvent.id === event.id);
    if (!shouldUpdate) {
      return;
    }
    setEvents((previousEvents) => {
      const nextEvents = previousEvents.map((currentEvent) => {
        if (currentEvent.id !== event.id) {
          return currentEvent;
        }
        return {
          ...event,
          id: event.id,
        };
      });
      persistEvents(nextEvents);
      return nextEvents;
    });
    const eventName = event.name.trim();
    showSuccessToast(
      eventName.length > 0
        ? `Event "${eventName}" updated successfully`
        : "Event updated successfully",
    );
  }, [events, showSuccessToast]);

  const deleteEvent = useCallback((eventId: string) => {
    const eventToDelete = events.find((currentEvent) => currentEvent.id === eventId);
    if (eventToDelete === undefined) {
      return;
    }
    setEvents((previousEvents) => {
      const nextEvents = previousEvents.filter((currentEvent) => {
        return currentEvent.id !== eventId;
      });
      persistEvents(nextEvents);
      return nextEvents;
    });
    const deletedEventName = eventToDelete.name.trim();
    showSuccessToast(
      deletedEventName.length > 0
        ? `Event "${deletedEventName}" deleted successfully`
        : "Event deleted successfully",
    );
  }, [events, showSuccessToast]);

  const value = useMemo<EventContextType>(
    () => ({
      events,
      createEvent,
      updateEvent,
      deleteEvent,
    }),
    [createEvent, deleteEvent, events, updateEvent],
  );

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}
