export const VISIBLE_DAY_OPTIONS = [1, 3, 5, 7, 14] as const;
export const DEFAULT_VISIBLE_DAY_COUNT = 7;

export const getVisibleRangeOffsets = (
  visibleDayCount: number,
): { daysBefore: number; daysAfter: number } => {
  const daysBefore = Math.floor(visibleDayCount / 2);
  const daysAfter = visibleDayCount - daysBefore - 1;
  return { daysBefore, daysAfter };
};
