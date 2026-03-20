import type { Event, EventOptions } from "../types";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const EVENT_TYPE_OPTIONS: readonly EventOptions[] = [
  "EVENT",
  "APPOINTMENT",
  "TASK",
] as const;

export type EventDraft = {
  name: string;
  date: string;
  time: string;
  durationMinutes: string;
  eventType: EventOptions;
  description: string;
  location: string;
  notes: string;
  people: string;
};

export type EventDraftErrors = {
  name?: string;
  date?: string;
  time?: string;
  duration?: string;
};

export const formatCalendarDateToIsoDate = (
  year: number,
  monthIndex: number,
  dayOfMonth: number,
): string => {
  const month = String(monthIndex + 1).padStart(2, "0");
  const day = String(dayOfMonth).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isValidIsoDateString = (iso: string): boolean => {
  if (!ISO_DATE_REGEX.test(iso)) {
    return false;
  }
  const [yStr, mStr, dStr] = iso.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  const candidate = new Date(year, month - 1, day);
  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
};

export const isEventOption = (value: string): value is EventOptions => {
  return value === "EVENT" || value === "APPOINTMENT" || value === "TASK";
};

export const normalizeTimeToHms = (timeValue: string): string | null => {
  const trimmed = timeValue.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const segments = trimmed.split(":");
  if (segments.length === 2) {
    const [h, m] = segments;
    const hh = Number(h);
    const mm = Number(m);
    if (
      !Number.isInteger(hh) ||
      !Number.isInteger(mm) ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59
    ) {
      return null;
    }
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  }
  if (segments.length === 3) {
    const [h, m, s] = segments;
    const hh = Number(h);
    const mm = Number(m);
    const ss = Number(s);
    if (
      !Number.isInteger(hh) ||
      !Number.isInteger(mm) ||
      !Number.isInteger(ss) ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59 ||
      ss < 0 ||
      ss > 59
    ) {
      return null;
    }
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return null;
};

export const parsePeopleFromCommaList = (raw: string): string[] => {
  return raw
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

export const parseDurationMinutesToSeconds = (
  rawMinutes: string,
): number | null => {
  const trimmed = rawMinutes.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const minutes = Number(trimmed);
  if (!Number.isInteger(minutes) || minutes <= 0) {
    return null;
  }
  return minutes * 60;
};

export const buildEventFromDraft = (draft: EventDraft): {
  event: Event | null;
  errors: EventDraftErrors;
} => {
  const errors: EventDraftErrors = {};
  const nameTrimmed = draft.name.trim();
  if (nameTrimmed.length === 0) {
    errors.name = "Name is required.";
  }

  if (!isValidIsoDateString(draft.date)) {
    errors.date = "Enter a valid date.";
  }

  const timeHms = normalizeTimeToHms(draft.time);
  if (timeHms === null) {
    errors.time = "Enter a valid time.";
  }

  const durationSeconds = parseDurationMinutesToSeconds(draft.durationMinutes);
  if (durationSeconds === null) {
    errors.duration = "Duration must be a whole number of minutes (min 1).";
  }

  if (Object.keys(errors).length > 0 || timeHms === null || durationSeconds === null) {
    return { event: null, errors };
  }

  const people = parsePeopleFromCommaList(draft.people);
  const event: Event = {
    name: nameTrimmed,
    date: draft.date,
    time: timeHms,
    duration: durationSeconds,
    type: draft.eventType,
    ...(draft.description.trim().length > 0
      ? { description: draft.description.trim() }
      : {}),
    ...(draft.location.trim().length > 0
      ? { location: draft.location.trim() }
      : {}),
    ...(draft.notes.trim().length > 0 ? { notes: draft.notes.trim() } : {}),
    ...(people.length > 0 ? { people } : {}),
  };
  return { event, errors };
};
