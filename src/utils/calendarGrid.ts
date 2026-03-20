import type { DayColumn, Event } from "../types";
import type { CalendarRenderEvent } from "../types/calendar";
import { addDaysToIsoDate } from "./calendarDate";
import { DAY_MINUTES, formatSegmentTimeRange, parseStartMinutes } from "./eventTime";

export const HOUR_WIDTH = 50;
export const HOUR_HEIGHT = 50;
export const MIN_EVENT_HEIGHT = 32;
export const MIN_EVENT_HEIGHT_COMPACT = 18;
export const COMPACT_EVENT_MAX_MINUTES = 30;
export const END_OF_DAY_PADDING = 52;
export const DAY_HEIGHT = 24 * HOUR_HEIGHT + END_OF_DAY_PADDING;

export const buildRenderedEventsByDate = (
  events: Event[],
  dayColumns: DayColumn[],
): Map<string, CalendarRenderEvent[]> => {
  const visibleDates = new Set(dayColumns.map((day) => day.isoDate));
  const grouped = new Map<string, CalendarRenderEvent[]>();

  for (const event of events) {
    const startMinutes = parseStartMinutes(event.time);
    if (startMinutes === null || event.duration <= 0) {
      continue;
    }

    let remainingSeconds = event.duration;
    let segmentDayOffset = 0;
    let segmentStartMinutes = startMinutes;

    while (remainingSeconds > 0) {
      if (segmentStartMinutes >= DAY_MINUTES) {
        segmentDayOffset += 1;
        segmentStartMinutes = 0;
        continue;
      }

      const maxSegmentSeconds = (DAY_MINUTES - segmentStartMinutes) * 60;
      if (maxSegmentSeconds <= 0) {
        segmentDayOffset += 1;
        segmentStartMinutes = 0;
        continue;
      }

      const segmentSeconds = Math.min(remainingSeconds, maxSegmentSeconds);
      const segmentEndMinutes = segmentStartMinutes + segmentSeconds / 60;
      const segmentDate = addDaysToIsoDate(event.date, segmentDayOffset);

      if (visibleDates.has(segmentDate)) {
        const segmentDurationMinutes = segmentSeconds / 60;
        const useCompactLabel =
          segmentDurationMinutes <= COMPACT_EVENT_MAX_MINUTES;
        const topPx = (segmentStartMinutes / 60) * HOUR_HEIGHT;
        const rawHeightPx = (segmentSeconds / 3600) * HOUR_HEIGHT;
        const heightPx = Math.max(
          useCompactLabel ? MIN_EVENT_HEIGHT_COMPACT : MIN_EVENT_HEIGHT,
          rawHeightPx,
        );
        const clampedHeightPx = Math.min(heightPx, DAY_HEIGHT - topPx);

        if (clampedHeightPx > 0) {
          const dayEvents = grouped.get(segmentDate) ?? [];
          const continuesToNextDay = remainingSeconds > segmentSeconds;
          const nextEvent: CalendarRenderEvent = {
            key:
              typeof event.id === "string"
                ? `${event.id}-segment-${segmentDayOffset}`
                : `${event.date}-${event.time}-${event.name}-${segmentDayOffset}-${dayEvents.length}`,
            sourceEvent: event,
            name: event.name,
            timeRangeLabel: formatSegmentTimeRange(
              segmentStartMinutes,
              segmentEndMinutes,
            ),
            useCompactLabel,
            ...(event.location ? { location: event.location } : {}),
            type: event.type,
            topPx,
            heightPx: clampedHeightPx,
            continuesFromPreviousDay: segmentDayOffset > 0,
            continuesToNextDay,
          };
          dayEvents.push(nextEvent);
          grouped.set(segmentDate, dayEvents);
        }
      }

      remainingSeconds -= segmentSeconds;
      segmentDayOffset += 1;
      segmentStartMinutes = 0;
    }
  }

  for (const dayEvents of grouped.values()) {
    dayEvents.sort((a, b) => a.topPx - b.topPx);
  }

  return grouped;
};

export const appendTwoDigits = (x: number): string =>
  x >= 10 ? x.toString() : `0${x}`;
