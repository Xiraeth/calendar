import type { Event } from "../types";

export type CalendarRenderEvent = {
  key: string;
  sourceEvent: Event;
  name: string;
  timeRangeLabel: string;
  useCompactLabel: boolean;
  location?: string;
  type: "TASK" | "APPOINTMENT" | "EVENT";
  topPx: number;
  heightPx: number;
  continuesFromPreviousDay: boolean;
  continuesToNextDay: boolean;
};

export type AnchorRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type CalendarEventPreviewState = {
  event: Event;
  anchorRect: AnchorRect;
};
