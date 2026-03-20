"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type JSX,
} from "react";
import { createPortal } from "react-dom";
import type { Event } from "../types";
import Button from "./button";
import {
  buildEventFromDraft,
  EVENT_TYPE_OPTIONS,
  formatCalendarDateToIsoDate,
  isEventOption,
  isValidIsoDateString,
  type EventDraft,
  type EventDraftErrors,
} from "../utils/eventPayload";
import {
  buildYearOptions,
  DATE_PICKER_MAX_YEAR,
  DATE_PICKER_MIN_YEAR,
  getDaysInMonth,
  MONTH_OPTIONS,
  parseIsoDateParts,
  parseTimeParts,
} from "../utils/eventFormDate";

export type NewEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  defaultDate: string;
  defaultTime?: string;
  initialEvent?: Event;
};

type FormState = EventDraft;

const emptyFormState = (
  defaultDate: string,
  defaultTime: string,
  initialEvent?: Event,
): EventDraft => {
  if (initialEvent === undefined) {
    return {
      name: "",
      date: defaultDate,
      time: defaultTime,
      durationMinutes: "60",
      eventType: "EVENT",
      description: "",
      location: "",
      notes: "",
      people: "",
    };
  }
  return {
    name: initialEvent.name,
    date: initialEvent.date,
    time: initialEvent.time.slice(0, 5),
    durationMinutes: String(
      Math.max(1, Math.floor(initialEvent.duration / 60)),
    ),
    eventType: initialEvent.type,
    description: initialEvent.description ?? "",
    location: initialEvent.location ?? "",
    notes: initialEvent.notes ?? "",
    people: initialEvent.people?.join(", ") ?? "",
  };
};

const resolveDefaultEventDate = (defaultDate: string): string => {
  if (isValidIsoDateString(defaultDate)) {
    return defaultDate;
  }
  const now = new Date();
  return formatCalendarDateToIsoDate(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
};

export default function NewEventModal({
  isOpen,
  onClose,
  onCreate,
  onDelete,
  defaultDate,
  defaultTime = "09:00",
  initialEvent,
}: NewEventModalProps): JSX.Element | null {
  const isEditMode = initialEvent !== undefined;
  const titleId = useId();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    emptyFormState(
      resolveDefaultEventDate(defaultDate),
      defaultTime,
      initialEvent,
    ),
  );
  const [errors, setErrors] = useState<EventDraftErrors>({});
  const dateParts = useMemo(() => {
    const parsed = parseIsoDateParts(form.date);
    if (parsed !== null) {
      return parsed;
    }
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }, [form.date]);
  const timeParts = useMemo(() => parseTimeParts(form.time), [form.time]);
  const yearOptions = useMemo(
    () => buildYearOptions(DATE_PICKER_MIN_YEAR, DATE_PICKER_MAX_YEAR),
    [],
  );
  const monthOptions = MONTH_OPTIONS;
  const dayOptions = useMemo(
    () =>
      Array.from(
        { length: getDaysInMonth(dateParts.year, dateParts.month) },
        (_, index) => index + 1,
      ),
    [dateParts.month, dateParts.year],
  );
  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, index) => index),
    [],
  );
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, index) => index),
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Enter" || event.defaultPrevented) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      event.preventDefault();
      formRef.current?.requestSubmit();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key === "name") {
        setErrors((prev) => ({ ...prev, name: undefined }));
      } else if (key === "date") {
        setErrors((prev) => ({ ...prev, date: undefined }));
      } else if (key === "time") {
        setErrors((prev) => ({ ...prev, time: undefined }));
      } else if (key === "durationMinutes") {
        setErrors((prev) => ({ ...prev, duration: undefined }));
      }
    },
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const built = buildEventFromDraft(form);
    setErrors(built.errors);
    if (built.event === null) {
      return;
    }
    onCreate(
      initialEvent?.id
        ? {
            ...built.event,
            id: initialEvent.id,
          }
        : built.event,
    );
    onClose();
  };

  const handleDelete = () => {
    if (
      !isEditMode ||
      typeof initialEvent?.id !== "string" ||
      onDelete === undefined
    ) {
      return;
    }
    onDelete(initialEvent.id);
    onClose();
  };

  const handleDatePartChange = (
    part: "year" | "month" | "day",
    rawValue: string,
  ) => {
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed)) {
      return;
    }
    const nextYear = part === "year" ? parsed : dateParts.year;
    const nextMonth = part === "month" ? parsed : dateParts.month;
    const maxDay = getDaysInMonth(nextYear, nextMonth);
    const nextDay = Math.min(part === "day" ? parsed : dateParts.day, maxDay);
    updateField(
      "date",
      `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`,
    );
  };

  const handleTimePartChange = (part: "hour" | "minute", rawValue: string) => {
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed)) {
      return;
    }
    const nextHour = part === "hour" ? parsed : timeParts.hour;
    const nextMinute = part === "minute" ? parsed : timeParts.minute;
    updateField(
      "time",
      `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`,
    );
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 id={titleId} className="text-lg font-semibold text-slate-800">
            {isEditMode ? "Edit event" : "New event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 p-4"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="event-name"
              className="text-sm font-medium text-slate-700"
            >
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="event-name"
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              autoComplete="off"
            />
            {errors.name ? (
              <p className="text-xs text-red-600">{errors.name}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Date <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label="Event month"
                  value={dateParts.month}
                  onChange={(e) =>
                    handleDatePartChange("month", e.target.value)
                  }
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {monthOptions.map((monthOption) => (
                    <option key={monthOption.value} value={monthOption.value}>
                      {monthOption.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Event day"
                  value={dateParts.day}
                  onChange={(e) => handleDatePartChange("day", e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {dayOptions.map((dayOption) => (
                    <option key={dayOption} value={dayOption}>
                      {dayOption}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Event year"
                  value={dateParts.year}
                  onChange={(e) => handleDatePartChange("year", e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {yearOptions.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
              {errors.date ? (
                <p className="text-xs text-red-600">{errors.date}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Start time <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <select
                  aria-label="Event hour"
                  value={timeParts.hour}
                  onChange={(e) => handleTimePartChange("hour", e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {hourOptions.map((hourOption) => (
                    <option key={hourOption} value={hourOption}>
                      {String(hourOption).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">:</span>
                <select
                  aria-label="Event minute"
                  value={timeParts.minute}
                  onChange={(e) =>
                    handleTimePartChange("minute", e.target.value)
                  }
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {minuteOptions.map((minuteOption) => (
                    <option key={minuteOption} value={minuteOption}>
                      {String(minuteOption).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              {errors.time ? (
                <p className="text-xs text-red-600">{errors.time}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="event-duration"
                className="text-sm font-medium text-slate-700"
              >
                Duration (minutes) <span className="text-red-600">*</span>
              </label>
              <input
                id="event-duration"
                type="number"
                min={1}
                step={1}
                value={form.durationMinutes}
                onChange={(e) => updateField("durationMinutes", e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {errors.duration ? (
                <p className="text-xs text-red-600">{errors.duration}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="event-type"
                className="text-sm font-medium text-slate-700"
              >
                Type
              </label>
              <select
                id="event-type"
                value={form.eventType}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isEventOption(value)) {
                    updateField("eventType", value);
                  }
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0) + opt.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="event-location"
              className="text-sm font-medium text-slate-700"
            >
              Location
            </label>
            <input
              id="event-location"
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="event-description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="event-description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 resize-y min-h-[72px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="event-notes"
              className="text-sm font-medium text-slate-700"
            >
              Notes
            </label>
            <textarea
              id="event-notes"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={2}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 resize-y min-h-[56px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="event-people"
              className="text-sm font-medium text-slate-700"
            >
              People (comma-separated)
            </label>
            <input
              id="event-people"
              type="text"
              value={form.people}
              onChange={(e) => updateField("people", e.target.value)}
              placeholder="e.g. Alex, Sam"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            {isEditMode && typeof initialEvent?.id === "string" ? (
              <Button
                text="Delete"
                type="button"
                onClick={handleDelete}
                className="h-10 mr-auto bg-red-600 !border-red-600 text-white hover:!bg-red-700"
              />
            ) : null}
            <Button
              text="Cancel"
              type="button"
              onClick={onClose}
              className="h-10 bg-white"
            />
            <Button
              text={isEditMode ? "Save changes" : "Create event"}
              type="submit"
              className="h-10 bg-indigo-600 !border-indigo-600 text-white hover:!bg-indigo-700"
            />
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
