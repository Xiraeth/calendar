export const DAY_MINUTES = 24 * 60;

export const parseStartMinutes = (time: string): number | null => {
  const parts = time.split(":");
  if (parts.length < 2) {
    return null;
  }
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
};

export const formatStartLabel = (time: string): string => {
  const parts = time.split(":");
  if (parts.length < 2) {
    return time;
  }
  const hours = parts[0].padStart(2, "0");
  const minutes = parts[1].padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatMinutesToHm = (minutesFromMidnight: number): string => {
  const clampedMinutes = Math.max(
    0,
    Math.min(DAY_MINUTES, minutesFromMidnight),
  );
  if (clampedMinutes === DAY_MINUTES) {
    return "00:00";
  }
  const hours = Math.floor(clampedMinutes / 60);
  const minutes = clampedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const formatTimeRange = (
  time: string,
  durationSeconds: number,
): string => {
  const startMinutes = parseStartMinutes(time);
  if (startMinutes === null) {
    return formatStartLabel(time);
  }
  const durationMinutes = Math.max(1, Math.floor(durationSeconds / 60));
  const endMinutesTotal = startMinutes + durationMinutes;
  if (endMinutesTotal <= DAY_MINUTES) {
    return `${formatMinutesToHm(startMinutes)} - ${formatMinutesToHm(endMinutesTotal)}`;
  }
  const overflowDays = Math.floor(endMinutesTotal / DAY_MINUTES);
  const endMinutesInDay = endMinutesTotal % DAY_MINUTES;
  return `${formatMinutesToHm(startMinutes)} - ${formatMinutesToHm(endMinutesInDay)} (+${overflowDays}d)`;
};

export const formatSegmentTimeRange = (
  segmentStartMinutes: number,
  segmentEndMinutes: number,
): string => {
  const endLabel = formatMinutesToHm(Math.min(segmentEndMinutes, DAY_MINUTES));
  return `${formatMinutesToHm(segmentStartMinutes)} - ${endLabel}`;
};

export const formatDurationLabel = (durationSeconds: number): string => {
  const totalMinutes = Math.max(1, Math.floor(durationSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${minutes} min`;
};
