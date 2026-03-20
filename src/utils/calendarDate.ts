import { formatCalendarDateToIsoDate } from "./eventPayload";

export const addDaysToIsoDate = (isoDate: string, daysToAdd: number): string => {
  const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return isoDate;
  }
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);
  return formatCalendarDateToIsoDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
};
