import { isValidIsoDateString } from "./eventPayload";

export const DATE_PICKER_MIN_YEAR = 1970;
export const DATE_PICKER_MAX_YEAR = 2100;

export const MONTH_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
] as const;

export const getDaysInMonth = (year: number, monthOneBased: number): number => {
  return new Date(year, monthOneBased, 0).getDate();
};

export const parseIsoDateParts = (
  isoDate: string,
): { year: number; month: number; day: number } | null => {
  if (!isValidIsoDateString(isoDate)) {
    return null;
  }
  const [yearText, monthText, dayText] = isoDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }
  return { year, month, day };
};

export const parseTimeParts = (
  timeValue: string,
): { hour: number; minute: number } => {
  const [hourText, minuteText] = timeValue.split(":");
  const parsedHour = Number(hourText);
  const parsedMinute = Number(minuteText);
  if (
    Number.isInteger(parsedHour) &&
    Number.isInteger(parsedMinute) &&
    parsedHour >= 0 &&
    parsedHour <= 23 &&
    parsedMinute >= 0 &&
    parsedMinute <= 59
  ) {
    return { hour: parsedHour, minute: parsedMinute };
  }
  return { hour: 9, minute: 0 };
};

export const buildYearOptions = (
  minYear: number,
  maxYear: number,
): number[] => {
  return Array.from(
    { length: maxYear - minYear + 1 },
    (_, index) => minYear + index,
  );
};
