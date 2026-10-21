import { useEffect, type RefObject } from "react";
import type { TSwipeHandlers } from "./gestures.types";

const MIN_DISTANCE_PX = 60;
const MIN_HORIZONTAL_RATIO = 1.5;
const VERTICAL_CANCEL_PX = 10;
// iOS Safari uses swipes from the screen edge for Back and Forward.
const EDGE_GUARD_PX = 24;

type TGestureStart = {
  id: number;
  x: number;
  y: number;
};

const findTouch = (touches: TouchList, id: number) =>
  Array.from(touches).find((touch) => touch.identifier === id);

const isDialogOpen = () => document.querySelector("dialog[open]") !== null;

const isFormControl = (target: EventTarget | null) =>
  target instanceof Element && target.closest("input, textarea, select") !== null;

/**
 * Calls `onSwipeLeft` or `onSwipeRight` after a one-finger horizontal swipe
 * on the element. Vertical scrolling, multitouch, edge swipes, form
 * controls and open dialogs never trigger it. Changing a callback resets any
 * gesture in progress, so pass stable callbacks.
 */
export const useHorizontalSwipe = (
  ref: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight }: TSwipeHandlers,
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element || (!onSwipeLeft && !onSwipeRight)) return;

    let start: TGestureStart | null = null;

    // Listens on the document so that a second finger anywhere on the
    // screen, not only inside the element, cancels the gesture.
    const handleTouchStart = (event: TouchEvent) => {
      start = null;
      const touch = event.touches[0];
      if (event.touches.length !== 1 || !touch) return;
      if (!(event.target instanceof Node) || !element.contains(event.target)) return;
      if (touch.clientX < EDGE_GUARD_PX || touch.clientX > window.innerWidth - EDGE_GUARD_PX) return;
      if (isFormControl(event.target) || isDialogOpen()) return;

      start = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = start && findTouch(event.changedTouches, start.id);
      if (!start || !touch) return;

      const dx = Math.abs(touch.clientX - start.x);
      const dy = Math.abs(touch.clientY - start.y);
      if (dy >= VERTICAL_CANCEL_PX && dy > dx) {
        start = null;
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = start && findTouch(event.changedTouches, start.id);
      if (!start || !touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      start = null;
      if (isDialogOpen()) return;
      if (Math.abs(dx) < MIN_DISTANCE_PX || Math.abs(dx) <= MIN_HORIZONTAL_RATIO * Math.abs(dy)) return;

      const handler = dx < 0 ? onSwipeLeft : onSwipeRight;
      if (!handler) return;

      // Stops the tap that the browser would otherwise synthesize on the
      // link or button under the finger.
      if (event.cancelable) event.preventDefault();
      handler();
    };

    const handleTouchCancel = () => {
      start = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });
    element.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
};
