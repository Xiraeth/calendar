import { useEffect, useMemo, useState, type DragEvent } from "react";
import { clsx } from "clsx";
import { Pencil, Trash2, X } from "lucide-react";
import type { DayColumn, Event } from "../types";
import type { CalendarEventPreviewState } from "../types/calendar";
import { useDateContext } from "../context/useDateContext";
import { useEventContext } from "../context/useEventContext";
import { getVisibleRangeOffsets } from "../calendarConfig";
import { formatCalendarDateToIsoDate } from "../utils/eventPayload";
import {
  appendTwoDigits,
  buildRenderedEventsByDate,
  COMPACT_EVENT_MAX_MINUTES,
  DAY_HEIGHT,
  END_OF_DAY_PADDING,
  HOUR_HEIGHT,
  HOUR_WIDTH,
  MIN_EVENT_HEIGHT,
  MIN_EVENT_HEIGHT_COMPACT,
} from "../utils/calendarGrid";
import {
  DAY_MINUTES,
  formatDurationLabel,
  formatTimeRange,
  parseStartMinutes,
} from "../utils/eventTime";
import { resolvePreviewPosition } from "../utils/calendarPreviewLayout";
import { addDaysToIsoDate } from "../utils/calendarDate";
import NewEventModal from "./NewEventModal";

type DragPreviewState = {
  eventId: string;
  date: string;
  topPx: number;
  heightPx: number;
  timeRangeLabel: string;
  useCompactLabel: boolean;
  continuesToNextDay: boolean;
};

const formatIsoDateToDDMMYYYY = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  if (
    typeof year !== "string" ||
    typeof month !== "string" ||
    typeof day !== "string" ||
    year.length !== 4 ||
    month.length !== 2 ||
    day.length !== 2
  ) {
    return isoDate;
  }
  return `${day}-${month}-${year}`;
};

const Calendar = () => {
  const { selectedYear, selectedMonth, selectedDate, visibleDayCount } =
    useDateContext();
  const { events, createEvent, updateEvent, deleteEvent } = useEventContext();
  const [createSlot, setCreateSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [previewEvent, setPreviewEvent] =
    useState<CalendarEventPreviewState | null>(null);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [dragGrabOffsetMinutes, setDragGrabOffsetMinutes] = useState(0);
  const [dragPreviewState, setDragPreviewState] =
    useState<DragPreviewState | null>(null);
  const dayHourCycle = useMemo(() => Array.from({ length: 24 }), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const dayColumns = useMemo<DayColumn[]>(() => {
    const baseDate = new Date(selectedYear, selectedMonth, selectedDate);
    const isWeekView = visibleDayCount === 7;
    const { daysBefore } = getVisibleRangeOffsets(visibleDayCount);
    const mondayBasedDayIndex = (baseDate.getDay() + 6) % 7;
    const weekStartDate = new Date(baseDate);
    weekStartDate.setDate(baseDate.getDate() - mondayBasedDayIndex);
    const today = new Date();
    const todayAtMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const fullHeaderFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return Array.from({ length: visibleDayCount }, (_, index) => {
      const date = isWeekView ? new Date(weekStartDate) : new Date(baseDate);
      if (isWeekView) {
        date.setDate(weekStartDate.getDate() + index);
      } else {
        const offset = index - daysBefore;
        date.setDate(baseDate.getDate() + offset);
      }
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      return {
        key: formatCalendarDateToIsoDate(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ),
        isoDate: formatCalendarDateToIsoDate(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ),
        label:
          visibleDayCount === 14
            ? `${date.getDate()}/${date.getMonth() + 1}`
            : fullHeaderFormatter.format(date),
        isToday: normalizedDate.getTime() === todayAtMidnight.getTime(),
      };
    });
  }, [selectedDate, selectedMonth, selectedYear, visibleDayCount]);

  const renderedEventsByDate = useMemo(
    () => buildRenderedEventsByDate(events, dayColumns),
    [dayColumns, events],
  );

  const hasTodayVisible = useMemo(
    () => dayColumns.some((day) => day.isToday),
    [dayColumns],
  );

  const nowLineTopPx = useMemo(() => {
    const minutesFromMidnight =
      now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    return (minutesFromMidnight / 60) * HOUR_HEIGHT;
  }, [now]);

  const dayGridHeightPx = 24 * HOUR_HEIGHT;
  const showNowLine =
    hasTodayVisible && nowLineTopPx >= 0 && nowLineTopPx <= dayGridHeightPx;

  const defaultModalDate = formatCalendarDateToIsoDate(
    selectedYear,
    selectedMonth,
    selectedDate,
  );
  const editModalKey =
    editingEvent !== null
      ? `edit-${editingEvent.id ?? editingEvent.name}`
      : "closed";
  const createModalKey =
    createSlot !== null
      ? `create-${createSlot.date}-${createSlot.time}`
      : "create-closed";

  const handleCreateSave = (event: Event) => {
    createEvent(event);
  };
  const handleEditSave = (event: Event) => {
    updateEvent(event);
  };
  const handleEditDelete = (eventId: string) => {
    deleteEvent(eventId);
  };
  const handlePreviewEdit = () => {
    if (previewEvent === null) {
      return;
    }
    setEditingEvent(previewEvent.event);
    setPreviewEvent(null);
  };
  const handlePreviewDelete = () => {
    if (previewEvent === null || typeof previewEvent.event.id !== "string") {
      return;
    }
    deleteEvent(previewEvent.event.id);
    setPreviewEvent(null);
  };
  const previewPosition =
    previewEvent === null
      ? null
      : resolvePreviewPosition(previewEvent.anchorRect);
  const draggingEvent =
    draggingEventId === null
      ? null
      : events.find((event) => event.id === draggingEventId) ?? null;
  const handleSlotClick = (date: string, hour24: string) => {
    setPreviewEvent(null);
    setCreateSlot({ date, time: `${hour24}:00` });
  };
  const resolveDropTime = (
    hour24: string,
    dropEvent: DragEvent<HTMLButtonElement>,
  ): { time: string; dayOffset: number } => {
    const baseHour = Number.parseInt(hour24, 10);
    const rect = dropEvent.currentTarget.getBoundingClientRect();
    const relativeY = Math.max(
      0,
      Math.min(dropEvent.clientY - rect.top, rect.height),
    );
    const slotMinutes = (relativeY / rect.height) * 60;
    const pointerMinutesFromMidnight = baseHour * 60 + slotMinutes;
    const anchoredStartMinutes =
      pointerMinutesFromMidnight - dragGrabOffsetMinutes;
    const snappedMinutes = Math.round(anchoredStartMinutes / 15) * 15;
    const clampedMinutes = Math.max(0, Math.min(24 * 60, snappedMinutes));
    const dayOffset = clampedMinutes >= 24 * 60 ? 1 : 0;
    const minutesInDay = dayOffset === 1 ? 0 : clampedMinutes;
    const normalizedHour = Math.floor(minutesInDay / 60);
    const minutes = minutesInDay % 60;
    return {
      time: `${appendTwoDigits(normalizedHour)}:${appendTwoDigits(minutes)}`,
      dayOffset,
    };
  };
  const handleSlotDragOver = (
    date: string,
    hour24: string,
    slotKey: string,
    dragEvent: DragEvent<HTMLButtonElement>,
  ) => {
    if (draggingEventId === null) {
      return;
    }
    dragEvent.preventDefault();
    dragEvent.dataTransfer.dropEffect = "move";
    setDropTargetKey(slotKey);

    const draggedEvent = events.find((event) => event.id === draggingEventId);
    if (draggedEvent === undefined || typeof draggedEvent.id !== "string") {
      setDragPreviewState(null);
      return;
    }

    const { time, dayOffset } = resolveDropTime(hour24, dragEvent);
    const nextDate = dayOffset === 0 ? date : addDaysToIsoDate(date, dayOffset);
    const startMinutes = parseStartMinutes(time);
    if (startMinutes === null) {
      setDragPreviewState(null);
      return;
    }

    const maxSegmentSeconds = Math.max(0, (DAY_MINUTES - startMinutes) * 60);
    const segmentSeconds = Math.min(draggedEvent.duration, maxSegmentSeconds);
    const segmentDurationMinutes = segmentSeconds / 60;
    const useCompactLabel = segmentDurationMinutes <= COMPACT_EVENT_MAX_MINUTES;
    const topPx = (startMinutes / 60) * HOUR_HEIGHT;
    const rawHeightPx = (segmentSeconds / 3600) * HOUR_HEIGHT;
    const minHeight = useCompactLabel ? MIN_EVENT_HEIGHT_COMPACT : MIN_EVENT_HEIGHT;
    const heightPx = Math.min(Math.max(minHeight, rawHeightPx), DAY_HEIGHT - topPx);

    setDragPreviewState({
      eventId: draggedEvent.id,
      date: nextDate,
      topPx,
      heightPx,
      timeRangeLabel: formatTimeRange(time, draggedEvent.duration),
      useCompactLabel,
      continuesToNextDay: draggedEvent.duration > segmentSeconds,
    });
  };
  const handleSlotDrop = (
    date: string,
    hour24: string,
    dragEvent: DragEvent<HTMLButtonElement>,
  ) => {
    dragEvent.preventDefault();
    dragEvent.stopPropagation();
    setDropTargetKey(null);
    setPreviewEvent(null);

    const draggedEventId = dragEvent.dataTransfer.getData(
      "text/calendar-event-id",
    );
    if (draggedEventId.length === 0) {
      return;
    }
    const targetEvent = events.find((event) => event.id === draggedEventId);
    if (targetEvent === undefined || typeof targetEvent.id !== "string") {
      return;
    }

    const { time, dayOffset } = resolveDropTime(hour24, dragEvent);
    const nextDate = dayOffset === 0 ? date : addDaysToIsoDate(date, dayOffset);
    updateEvent({
      ...targetEvent,
      date: nextDate,
      time,
    });
    setDragPreviewState(null);
  };
  const clearDragState = () => {
    setDraggingEventId(null);
    setDropTargetKey(null);
    setDragGrabOffsetMinutes(0);
    setDragPreviewState(null);
  };

  return (
    <div
      className={clsx(
        "w-full flex-1 min-h-0 px-2 pb-2 overflow-hidden flex flex-col gap-2",
        draggingEventId !== null && "cursor-grabbing",
      )}
      onClick={() => setPreviewEvent(null)}
    >
      <NewEventModal
        key={createModalKey}
        isOpen={createSlot !== null}
        onClose={() => setCreateSlot(null)}
        onCreate={handleCreateSave}
        defaultDate={createSlot?.date ?? defaultModalDate}
        defaultTime={createSlot?.time ?? "09:00"}
      />
      <NewEventModal
        key={editModalKey}
        isOpen={editingEvent !== null}
        onClose={() => setEditingEvent(null)}
        onCreate={handleEditSave}
        onDelete={handleEditDelete}
        defaultDate={editingEvent?.date ?? defaultModalDate}
        initialEvent={editingEvent ?? undefined}
      />
      <div
        id="calendar-container"
        className="overflow-y-auto overflow-x-hidden bg-white px-2 rounded-md flex-1 min-h-0"
      >
        <div className="w-full flex flex-col min-w-0">
          <div className="sticky top-0 z-20 shrink-0 h-10 flex border-b border-gray-200 bg-white">
            <div
              className="shrink-0"
              style={{
                width: `${HOUR_WIDTH}px`,
                minWidth: `${HOUR_WIDTH}px`,
                maxWidth: `${HOUR_WIDTH}px`,
              }}
            />
            <div
              className="flex-1"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${dayColumns.length}, minmax(0, 1fr))`,
              }}
            >
              {dayColumns.map((day) => (
                <div
                  key={day.key}
                  className={clsx(
                    "flex select-none items-center justify-center text-[16px] border-l font-mono",
                    day.isToday
                      ? "font-semibold text-indigo-600 bg-indigo-50 border-r border border-indigo-600"
                      : "text-gray-700 border-gray-200",
                  )}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>

          <div
            className="min-w-0 relative"
            style={{ paddingBottom: `${END_OF_DAY_PADDING}px` }}
          >
            {dayHourCycle.map((_, i) => {
              const hours = appendTwoDigits(i);

              return (
                <div
                  key={hours}
                  className="flex min-h-0 box-border border-b border-gray-200 last:border-b-0"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  <div
                    className="flex justify-center items-center shrink-0 font-mono select-none"
                    style={{
                      width: `${HOUR_WIDTH}px`,
                      minWidth: `${HOUR_WIDTH}px`,
                      maxWidth: `${HOUR_WIDTH}px`,
                      height: "100%",
                    }}
                  >
                    {`${hours}:00`}
                  </div>

                  <div
                    className="flex-1 min-w-0"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${dayColumns.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {dayColumns.map((day) => (
                      <button
                        type="button"
                        aria-label={`Create event at ${hours}:00 on ${day.label}`}
                        onClick={() => handleSlotClick(day.isoDate, hours)}
                        onDragOver={(dragEvent) =>
                          handleSlotDragOver(
                            day.isoDate,
                            hours,
                            `${day.isoDate}-${hours}`,
                            dragEvent,
                          )
                        }
                        onDragLeave={() => {
                          setDropTargetKey(null);
                          setDragPreviewState(null);
                        }}
                        onDrop={(dragEvent) =>
                          handleSlotDrop(day.isoDate, hours, dragEvent)
                        }
                        key={`${day.key}-${hours}`}
                        className={clsx(
                          "border-l font-mono w-full text-left transition-colors hover:bg-indigo-50/40",
                          day.isToday
                            ? "border-r border-indigo-600"
                            : "border-gray-200",
                          dropTargetKey === `${day.isoDate}-${hours}` &&
                            "bg-indigo-100/80",
                        )}
                        style={{ height: "100%" }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="pointer-events-none absolute inset-0 z-0">
              <div
                className="relative h-full"
                style={{
                  paddingLeft: `${HOUR_WIDTH}px`,
                }}
              >
                <div
                  className="relative z-10 h-full"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${dayColumns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {dayColumns.map((day) => {
                    const dayEvents =
                      renderedEventsByDate.get(day.isoDate) ?? [];
                    return (
                      <div
                        key={`${day.key}-events`}
                        className="relative h-full"
                      >
                        {day.isToday && showNowLine ? (
                          <div
                            className="pointer-events-none absolute left-0 right-0 z-[5] h-0.5 bg-rose-600 shadow-[0_1px_3px_rgba(225,29,72,0.45)]"
                            style={{
                              top: `${nowLineTopPx}px`,
                            }}
                            role="presentation"
                            aria-hidden
                          />
                        ) : null}
                        {dayEvents.map((event) => (
                          <button
                            key={event.key}
                            type="button"
                            draggable
                            aria-label={`Open event preview for ${event.name}`}
                            onClick={(clickEvent) => {
                              if (draggingEventId !== null) {
                                return;
                              }
                              clickEvent.stopPropagation();
                              const rect =
                                clickEvent.currentTarget.getBoundingClientRect();
                              setPreviewEvent({
                                event: event.sourceEvent,
                                anchorRect: {
                                  top: rect.top,
                                  right: rect.right,
                                  bottom: rect.bottom,
                                  left: rect.left,
                                },
                              });
                            }}
                            onDragStart={(dragEvent) => {
                              if (typeof event.sourceEvent.id !== "string") {
                                dragEvent.preventDefault();
                                return;
                              }
                              const rect =
                                dragEvent.currentTarget.getBoundingClientRect();
                              const pointerOffsetPx = Math.max(
                                0,
                                Math.min(
                                  dragEvent.clientY - rect.top,
                                  rect.height,
                                ),
                              );
                              const pointerOffsetMinutes =
                                (pointerOffsetPx / HOUR_HEIGHT) * 60;
                              dragEvent.stopPropagation();
                              dragEvent.dataTransfer.effectAllowed = "move";
                              dragEvent.dataTransfer.setData(
                                "text/calendar-event-id",
                                event.sourceEvent.id,
                              );
                              setDraggingEventId(event.sourceEvent.id);
                              setDragGrabOffsetMinutes(pointerOffsetMinutes);
                              setPreviewEvent(null);
                            }}
                            onDragEnd={clearDragState}
                            className={clsx(
                              "pointer-events-auto absolute left-0 right-0 z-10 overflow-hidden rounded-sm border px-2 py-0.5 text-xs leading-tight shadow-sm text-left cursor-grab active:cursor-grabbing",
                              draggingEventId === event.sourceEvent.id &&
                                "opacity-50",
                              event.type === "TASK" &&
                                "border-amber-300 bg-amber-100 text-amber-900",
                              event.type === "APPOINTMENT" &&
                                "border-emerald-300 bg-emerald-100 text-emerald-900",
                              event.type === "EVENT" &&
                                "border-indigo-300 bg-indigo-100 text-indigo-900",
                            )}
                            style={{
                              top: `${event.topPx}px`,
                              height: `${event.heightPx}px`,
                            }}
                          >
                            {event.useCompactLabel ? (
                              <p className="truncate text-[11px]">
                                <span className="font-semibold text-current">
                                  {event.name}
                                </span>
                                <span className="mx-1 opacity-50">-</span>
                                <span className="font-medium opacity-70">
                                  {event.timeRangeLabel}
                                </span>
                                {event.continuesToNextDay ? (
                                  <span className="ml-1 font-medium opacity-70">
                                    (next day)
                                  </span>
                                ) : null}
                              </p>
                            ) : (
                              <>
                                <p className="truncate font-semibold">
                                  {event.name}
                                </p>
                                <p className="truncate text-[11px]">
                                  {event.timeRangeLabel}
                                </p>
                              </>
                            )}
                            {event.continuesToNextDay &&
                            !event.useCompactLabel ? (
                              <p className="mt-0.5 inline-flex rounded bg-slate-900/10 px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wide">
                                Continues next day
                              </p>
                            ) : null}
                          </button>
                        ))}
                        {dragPreviewState !== null &&
                        draggingEvent !== null &&
                        dragPreviewState.date === day.isoDate ? (
                          <div
                            className={clsx(
                              "pointer-events-none absolute left-0 right-0 z-20 overflow-hidden rounded-sm border-2 border-dashed px-2 py-0.5 text-xs leading-tight shadow text-left opacity-95",
                              draggingEvent.type === "TASK" &&
                                "border-amber-400 bg-amber-100/95 text-amber-900",
                              draggingEvent.type === "APPOINTMENT" &&
                                "border-emerald-400 bg-emerald-100/95 text-emerald-900",
                              draggingEvent.type === "EVENT" &&
                                "border-indigo-400 bg-indigo-100/95 text-indigo-900",
                            )}
                            style={{
                              top: `${dragPreviewState.topPx}px`,
                              height: `${dragPreviewState.heightPx}px`,
                            }}
                          >
                            {dragPreviewState.useCompactLabel ? (
                              <p className="truncate text-[11px]">
                                <span className="font-semibold text-current">
                                  {draggingEvent.name}
                                </span>
                                <span className="mx-1 opacity-50">-</span>
                                <span className="font-medium opacity-70">
                                  {dragPreviewState.timeRangeLabel}
                                </span>
                                {dragPreviewState.continuesToNextDay ? (
                                  <span className="ml-1 font-medium opacity-70">
                                    (next day)
                                  </span>
                                ) : null}
                              </p>
                            ) : (
                              <>
                                <p className="truncate font-semibold">
                                  {draggingEvent.name}
                                </p>
                                <p className="truncate text-[11px]">
                                  {dragPreviewState.timeRangeLabel}
                                </p>
                              </>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {previewEvent !== null && previewPosition !== null ? (
        <section
          role="dialog"
          aria-label="Event quick actions"
          onClick={(clickEvent) => clickEvent.stopPropagation()}
          className="fixed z-30 rounded-2xl border border-slate-400 bg-slate-100 p-4 shadow-xl"
          style={{
            left: `${previewPosition.left}px`,
            top: `${previewPosition.top}px`,
            width: `${previewPosition.width}px`,
            maxHeight: `${previewPosition.maxHeight}px`,
            overflowY: "auto",
            transform:
              previewPosition.verticalPlacement === "above"
                ? "translateY(-100%)"
                : "none",
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="preview-event-title text-base font-semibold text-slate-800">
                {previewEvent.event.name}
              </p>
              <p className="text-sm text-slate-500">
                {`${formatTimeRange(previewEvent.event.time, previewEvent.event.duration)} · `}
                <span className="text-indigo-600 italic">{`${previewEvent.event.type}`}</span>
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
              aria-label="Close preview"
              onClick={() => setPreviewEvent(null)}
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mb-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-800">Date:</span>{" "}
              {formatIsoDateToDDMMYYYY(previewEvent.event.date)}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Duration:</span>{" "}
              {formatDurationLabel(previewEvent.event.duration)}
            </p>
            {previewEvent.event.location ? (
              <p className="whitespace-pre-wrap break-words">
                <span className="font-semibold text-slate-800">Location:</span>{" "}
                {previewEvent.event.location}
              </p>
            ) : null}
            {previewEvent.event.description ? (
              <p className="whitespace-pre-wrap break-words">
                <span className="font-semibold text-slate-800">
                  Description:
                </span>{" "}
                {previewEvent.event.description}
              </p>
            ) : null}
            {previewEvent.event.notes ? (
              <p className="whitespace-pre-wrap break-words">
                <span className="font-semibold text-slate-800">Notes:</span>{" "}
                {previewEvent.event.notes}
              </p>
            ) : null}
            {previewEvent.event.people &&
            previewEvent.event.people.length > 0 ? (
              <p className="whitespace-pre-wrap break-words">
                <span className="font-semibold text-slate-800">People:</span>{" "}
                {previewEvent.event.people.join(", ")}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={handlePreviewEdit}
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
              onClick={handlePreviewDelete}
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Calendar;
