import type { Month, Day } from "./types";

export const MONTHS: Month[] = [
  { monthShort: "Jan", monthFull: "January" },
  { monthShort: "Feb", monthFull: "February" },
  { monthShort: "Mar", monthFull: "March" },
  { monthShort: "Apr", monthFull: "April" },
  { monthShort: "May", monthFull: "May" },
  { monthShort: "Jun", monthFull: "June" },
  { monthShort: "Jul", monthFull: "July" },
  { monthShort: "Aug", monthFull: "August" },
  { monthShort: "Sep", monthFull: "September" },
  { monthShort: "Oct", monthFull: "October" },
  { monthShort: "Nov", monthFull: "November" },
  { monthShort: "Dec", monthFull: "December" },
];

/**
 * Order matches `Date.getDay()`: 0 = Sunday … 6 = Saturday.
 * Index must align with getDay() when used as DAYS[date.getDay()].
 */
export const DAYS: Day[] = [
  {
    dayShort: "Sun",
    dayFull: "Sunday",
  },
  {
    dayShort: "Mon",
    dayFull: "Monday",
  },
  {
    dayShort: "Tue",
    dayFull: "Tuesday",
  },
  {
    dayShort: "Wed",
    dayFull: "Wednesday",
  },
  {
    dayShort: "Thu",
    dayFull: "Thursday",
  },
  {
    dayShort: "Fri",
    dayFull: "Friday",
  },
  {
    dayShort: "Sat",
    dayFull: "Saturday",
  },
];
