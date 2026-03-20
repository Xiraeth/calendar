import { MONTHS, DAYS } from "./constants";

export const formatDateToMonthDDYY = (dateVariable: Date): string => {
  const date = new Date(dateVariable);

  const month = MONTHS[date.getMonth()].monthFull;
  const year = date.getFullYear();
  const dateOfMonth = date.getDate();
  const day = DAYS[date.getDay()].dayFull;

  return `${day}, ${dateOfMonth} ${month} ${year}`;
};

export const handlePreviousClick = (
  selectedYear: number,
  selectedMonth: number,
  selectedDate: number,
  setSelectedYear: (year: number) => void,
  setSelectedMonth: (month: number) => void,
  setSelectedDate: (date: number) => void,
  setSelectedDay: (day: number) => void,
  stepDays = 1,
): void => {
  const currentDate = new Date(selectedYear, selectedMonth, selectedDate);
  const shiftedDate = new Date(
    currentDate.setDate(currentDate.getDate() - stepDays),
  );
  const newYear = shiftedDate.getFullYear();
  const newMonth = shiftedDate.getMonth();
  const newDate = shiftedDate.getDate();
  setSelectedYear(newYear);
  sessionStorage.setItem("selectedYear", String(newYear));
  setSelectedMonth(newMonth);
  sessionStorage.setItem("selectedMonth", String(newMonth));
  setSelectedDate(newDate);
  sessionStorage.setItem("selectedDate", String(newDate));
  setSelectedDay(shiftedDate.getDay());
  sessionStorage.setItem("selectedDay", String(shiftedDate.getDay()));
};

export const handleTodayClick = (
  setSelectedYear: (year: number) => void,
  setSelectedMonth: (month: number) => void,
  setSelectedDate: (date: number) => void,
  setSelectedDay: (day: number) => void,
): void => {
  const today = new Date();
  setSelectedYear(today.getFullYear());
  sessionStorage.setItem("selectedYear", String(today.getFullYear()));
  setSelectedMonth(today.getMonth());
  sessionStorage.setItem("selectedMonth", String(today.getMonth()));
  setSelectedDate(today.getDate());
  sessionStorage.setItem("selectedDate", String(today.getDate()));
  setSelectedDay(today.getDay());
  sessionStorage.setItem("selectedDay", String(today.getDay()));
};

export const handleNextClick = (
  selectedYear: number,
  selectedMonth: number,
  selectedDate: number,
  setSelectedYear: (year: number) => void,
  setSelectedMonth: (month: number) => void,
  setSelectedDate: (date: number) => void,
  setSelectedDay: (day: number) => void,
  stepDays = 1,
): void => {
  const currentDate = new Date(selectedYear, selectedMonth, selectedDate);
  const shiftedDate = new Date(
    currentDate.setDate(currentDate.getDate() + stepDays),
  );
  const newYear = shiftedDate.getFullYear();
  const newMonth = shiftedDate.getMonth();
  const newDate = shiftedDate.getDate();
  setSelectedYear(newYear);
  sessionStorage.setItem("selectedYear", String(newYear));
  setSelectedMonth(newMonth);
  sessionStorage.setItem("selectedMonth", String(newMonth));
  setSelectedDate(newDate);
  sessionStorage.setItem("selectedDate", String(newDate));
  setSelectedDay(shiftedDate.getDay());
  sessionStorage.setItem("selectedDay", String(shiftedDate.getDay()));
};
