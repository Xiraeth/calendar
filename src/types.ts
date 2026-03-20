export type Month = {
  monthShort: string;
  monthFull: string;
};

export type Day = {
  dayShort: string;
  dayFull: string;
};

export type EventOptions = "TASK" | "APPOINTMENT" | "EVENT";

export type Event = {
  id?: string;
  name: string;
  date: string; // ISO string: YYYY-MM-DD
  time: string; // HH:MM:SS format
  duration: number; // seconds
  type: EventOptions;
  description?: string;
  location?: string;
  notes?: string;
  people?: string[];
};

export type DayColumn = {
  key: string;
  isoDate: string;
  label: string;
  isToday: boolean;
};
