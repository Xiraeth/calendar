import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCallback, useState, type JSX } from "react";
import Button from "./button";
import NewEventModal from "./NewEventModal";
import MonthSelector from "./MonthSelector";
import YearSelector from "./YearSelector";
import DayRangeSelector from "./DayRangeSelector";
import { useDateContext } from "../context/useDateContext";
import { useEventContext } from "../context/useEventContext";
import type { Event } from "../types";
import {
  formatDateToMonthDDYY,
  handlePreviousClick,
  handleTodayClick,
  handleNextClick,
} from "../utils";
import { formatCalendarDateToIsoDate } from "../utils/eventPayload";

type IconNavigationButtonProps = {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
};

function IconNavigationButton({
  icon,
  label,
  onClick,
}: IconNavigationButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-300/80 bg-white/70 text-slate-700 shadow-sm transition-all duration-150 hover:bg-white active:scale-[0.97] active:bg-slate-100"
    >
      {icon}
    </button>
  );
}

export default function Navigation() {
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const { createEvent } = useEventContext();
  const {
    selectedDate,
    selectedMonth,
    selectedYear,
    setSelectedDate,
    setSelectedDay,
    setSelectedMonth,
    setSelectedYear,
    visibleDayCount,
  } = useDateContext();

  const defaultEventDate = formatCalendarDateToIsoDate(
    selectedYear,
    selectedMonth,
    selectedDate,
  );

  const handleCreateEvent = useCallback(
    (created: Event) => {
      createEvent(created);
    },
    [createEvent],
  );

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDate = new Date().getDate();

  const dateString = formatDateToMonthDDYY(
    new Date(currentYear, currentMonth, currentDate),
  );

  const modalKey = isNewEventModalOpen ? defaultEventDate : "closed";

  const timezoneLabel = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const previousHandler = () => {
    handlePreviousClick(
      selectedYear,
      selectedMonth,
      selectedDate,
      setSelectedYear,
      setSelectedMonth,
      setSelectedDate,
      setSelectedDay,
      visibleDayCount,
    );
  };

  const todayHandler = () => {
    handleTodayClick(
      setSelectedYear,
      setSelectedMonth,
      setSelectedDate,
      setSelectedDay,
    );
  };

  const nextHandler = () => {
    handleNextClick(
      selectedYear,
      selectedMonth,
      selectedDate,
      setSelectedYear,
      setSelectedMonth,
      setSelectedDate,
      setSelectedDay,
      visibleDayCount,
    );
  };

  return (
    <header className="w-full border-b">
      <NewEventModal
        key={modalKey}
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreate={handleCreateEvent}
        defaultDate={defaultEventDate}
      />
      <div className="w-full rounded-xl border border-slate-300/60 bg-gradient-to-b from-slate-100 to-slate-200/80 shadow-sm px-2 py-2 sm:px-4 lg:h-[88px] lg:flex lg:items-center lg:justify-between lg:gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 lg:flex-1">
          <div className="flex gap-2 sm:gap-3 items-center min-w-0 flex-1 lg:flex-nowrap">
            <Button
              iconBefore={<Plus className="size-4" />}
              text="New Event"
              onClick={() => setIsNewEventModalOpen(true)}
              className="bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md"
              textClassName="hidden sm:inline"
            />
            <div className="min-w-0">
              <p className="font-mono text-base sm:text-lg md:text-xl text-slate-800 font-semibold truncate min-w-0">
                {dateString}
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-center shrink-0">
            <IconNavigationButton
              icon={<ChevronLeft className="size-4" />}
              label="Go to previous day"
              onClick={previousHandler}
            />
            <Button
              text="Today"
              onClick={todayHandler}
              className="h-10 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            />
            <IconNavigationButton
              icon={<ChevronRight className="size-4" />}
              label="Go to next day"
              onClick={nextHandler}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 justify-end lg:mt-0 lg:shrink-0">
          <span className="hidden 2xl:inline-flex items-center rounded-md border border-slate-300 bg-white/80 px-2.5 h-10 text-xs text-slate-600 select-none pointer-events-none">
            {timezoneLabel}
          </span>
          <DayRangeSelector />

          <MonthSelector />
          <YearSelector />
        </div>
      </div>
    </header>
  );
}
