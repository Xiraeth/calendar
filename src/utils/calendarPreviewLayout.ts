import type { AnchorRect } from "../types/calendar";

const PREVIEW_VIEWPORT_MARGIN = 12;
const PREVIEW_POPUP_GAP = 8;
const PREVIEW_WIDTH = 500;
const PREVIEW_MAX_HEIGHT = 300;

export type PreviewPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  verticalPlacement: "below" | "above" | "side";
};

/**
 * Resolves the fixed-position coordinates for the event preview popup
 * relative to the bounding rect of the clicked calendar event.
 *
 * Priority: below event > above event, centered on the event block.
 * Fallback when vertical placement cannot fit: right of event > left of event.
 */
export const resolvePreviewPosition = (
  anchor: AnchorRect,
): PreviewPosition => {
  if (typeof window === "undefined") {
    return {
      left: PREVIEW_VIEWPORT_MARGIN,
      top: PREVIEW_VIEWPORT_MARGIN,
      width: PREVIEW_WIDTH,
      maxHeight: PREVIEW_MAX_HEIGHT,
      verticalPlacement: "below",
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(PREVIEW_WIDTH, vw - PREVIEW_VIEWPORT_MARGIN * 2);

  const belowTop = anchor.bottom + PREVIEW_POPUP_GAP;
  const aboveTopWithMaxHeight = anchor.top - PREVIEW_POPUP_GAP - PREVIEW_MAX_HEIGHT;
  const fitsBelow =
    belowTop + PREVIEW_MAX_HEIGHT <= vh - PREVIEW_VIEWPORT_MARGIN;
  const fitsAbove = aboveTopWithMaxHeight >= PREVIEW_VIEWPORT_MARGIN;

  const centeredLeft = anchor.left + (anchor.right - anchor.left) / 2 - width / 2;
  const clampedCenteredLeft = Math.max(
    PREVIEW_VIEWPORT_MARGIN,
    Math.min(centeredLeft, vw - PREVIEW_VIEWPORT_MARGIN - width),
  );
  const rightLeft = anchor.right + PREVIEW_POPUP_GAP;
  const leftLeft = anchor.left - PREVIEW_POPUP_GAP - width;
  const fitsRight = rightLeft + width <= vw - PREVIEW_VIEWPORT_MARGIN;
  const fitsLeft = leftLeft >= PREVIEW_VIEWPORT_MARGIN;

  let left: number;
  let top: number;
  let verticalPlacement: "below" | "above" | "side";
  if (fitsBelow) {
    left = clampedCenteredLeft;
    top = belowTop;
    verticalPlacement = "below";
  } else if (fitsAbove) {
    left = clampedCenteredLeft;
    top = anchor.top - PREVIEW_POPUP_GAP;
    verticalPlacement = "above";
  } else {
    if (fitsRight) {
      left = rightLeft;
    } else if (fitsLeft) {
      left = leftLeft;
    } else {
      left = clampedCenteredLeft;
    }

    const centeredTop = anchor.top + (anchor.bottom - anchor.top) / 2 - PREVIEW_MAX_HEIGHT / 2;
    top = Math.max(
      PREVIEW_VIEWPORT_MARGIN,
      Math.min(centeredTop, vh - PREVIEW_VIEWPORT_MARGIN - PREVIEW_MAX_HEIGHT),
    );
    verticalPlacement = "side";
  }

  return { left, top, width, maxHeight: PREVIEW_MAX_HEIGHT, verticalPlacement };
};
