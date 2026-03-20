import { useState } from "react";
import { DateContext } from "./DateContext";
import {
  DEFAULT_VISIBLE_DAY_COUNT,
  VISIBLE_DAY_OPTIONS,
} from "../calendarConfig";

/**
 * Reads a stored integer in range [min, max]; falls back if missing or invalid.
 */
const readStoredInt = (
  key: string,
  fallback: number,
  min: number,
  max: number,
): number => {
  const raw = sessionStorage.getItem(key);
  if (raw === null) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return fallback;
  }
  if (value < min || value > max) {
    return fallback;
  }
  return value;
};

const readStoredFullDate = (key: string): Date => {
  const raw = sessionStorage.getItem(key);
  if (raw === null) {
    return new Date();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "string" && typeof parsed !== "number") {
      return new Date();
    }
    const candidate = new Date(parsed);
    if (Number.isNaN(candidate.getTime())) {
      return new Date();
    }
    return candidate;
  } catch {
    return new Date();
  }
};

export default function DateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const parsedVisibleDayCount = Number(sessionStorage.getItem("visibleDayCount"));
  const initialVisibleDayCount = VISIBLE_DAY_OPTIONS.includes(
    parsedVisibleDayCount as (typeof VISIBLE_DAY_OPTIONS)[number],
  )
    ? parsedVisibleDayCount
    : DEFAULT_VISIBLE_DAY_COUNT;

  const now = new Date();

  const initialSelectedMonth = readStoredInt(
    "selectedMonth",
    now.getMonth(),
    0,
    11,
  );

  const initialSelectedDay = readStoredInt("selectedDay", now.getDay(), 0, 6);

  const initialSelectedYear = readStoredInt(
    "selectedYear",
    now.getFullYear(),
    1970,
    3000,
  );

  const initialSelectedDate = readStoredInt(
    "selectedDate",
    now.getDate(),
    1,
    31,
  );

  const initialSelectedFullDate = readStoredFullDate("selectedFullDate");

  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);

  const [selectedMonth, setSelectedMonth] = useState(initialSelectedMonth);

  const [selectedYear, setSelectedYear] = useState(initialSelectedYear);

  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [visibleDayCount, setVisibleDayCount] = useState(initialVisibleDayCount);

  const [selectedFullDate, setSelectedFullDate] = useState<Date>(
    initialSelectedFullDate,
  );

  return (
    <DateContext.Provider
      value={{
        selectedFullDate,
        setSelectedFullDate,
        selectedDay,
        setSelectedDay,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        selectedDate,
        setSelectedDate,
        visibleDayCount,
        setVisibleDayCount,
      }}
    >
      {children}
    </DateContext.Provider>
  );
}
