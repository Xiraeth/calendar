export const VISIBLE_DAY_OPTIONS = [1, 3, 5, 7, 14] as const;
export const DEFAULT_VISIBLE_DAY_COUNT = 7;
export const MOBILE_BREAKPOINT_PX = 700;
export const SMALL_MOBILE_BREAKPOINT_PX = 500;

export const getAllowedVisibleDayOptionsForWidth = (
  viewportWidth: number,
): readonly number[] => {
  if (viewportWidth < SMALL_MOBILE_BREAKPOINT_PX) {
    return [1] as const;
  }
  if (viewportWidth < MOBILE_BREAKPOINT_PX) {
    return [1, 3] as const;
  }
  return VISIBLE_DAY_OPTIONS;
};

export const getNormalizedVisibleDayCountForWidth = (
  requestedVisibleDayCount: number,
  viewportWidth: number,
): number => {
  const allowedOptions = getAllowedVisibleDayOptionsForWidth(viewportWidth);
  if (allowedOptions.includes(requestedVisibleDayCount)) {
    return requestedVisibleDayCount;
  }

  const sortedAscending = [...allowedOptions].sort((a, b) => a - b);
  const bestMatch = sortedAscending.reduce<number>((currentBest, option) => {
    if (option <= requestedVisibleDayCount) {
      return option;
    }
    return currentBest;
  }, sortedAscending[0]);
  return bestMatch;
};

export const getVisibleRangeOffsets = (
  visibleDayCount: number,
): { daysBefore: number; daysAfter: number } => {
  const daysBefore = Math.floor(visibleDayCount / 2);
  const daysAfter = visibleDayCount - daysBefore - 1;
  return { daysBefore, daysAfter };
};
