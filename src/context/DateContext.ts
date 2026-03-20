import { createContext } from "react";

type DateContextType = {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedDate: number;
  setSelectedDate: (date: number) => void;
  visibleDayCount: number;
  setVisibleDayCount: (days: number) => void;
  selectedFullDate?: Date;
  setSelectedFullDate?: (date: Date) => void;
};

export const DateContext = createContext<DateContextType>({
  selectedDay: new Date().getDay(),
  setSelectedDay: () => {},
  selectedMonth: new Date().getMonth(),
  setSelectedMonth: () => {},
  selectedYear: new Date().getFullYear(),
  setSelectedYear: () => {},
  selectedDate: new Date().getDate(),
  setSelectedDate: () => {},
  visibleDayCount: 7,
  setVisibleDayCount: () => {},
  selectedFullDate: new Date(),
  setSelectedFullDate: () => {},
});
