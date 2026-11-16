import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { periodPagerClasses as classes, periodPagerMotion } from "./period-pager.styles";
import type {
  IPagerPageProps,
  IPeriodPagerControls,
  IPeriodPagerProps,
  TDrag,
  TMotion,
  TPendingSettle,
  TPeriodDirection,
} from "./period-pager.types";
import {
  AXIS_LOCK_PX,
  clampOffset,
  CLICK_GUARD_MS,
  EDGE_GUARD_PX,
  getReleaseDirection,
  getVelocity,
  isDialogOpen,
  isIgnoredTarget,
  nextFrame,
  parseTranslateX,
  prefersReducedMotion,
  resistOffset,
} from "./period-pager.utils";

const NO_CONTROLS: IPeriodPagerControls = { onPrevious: () => {}, onNext: () => {} };

function PagerPage({ offset, controls, renderPage }: IPagerPageProps) {
  return renderPage(offset, controls);
}

/**
 * Shows one period with its neighbours beside it. A horizontal touch drag
 * follows the finger and, on release, moves to the neighbouring period;
 * the arrows a page renders through `controls` take the same path. The
 * period changes at release, and the slide only finishes the movement.
 */
export function PeriodPager({
  periodKey,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  renderPage,
}: IPeriodPagerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<TDrag | null>(null);
  const pendingRef = useRef<TPendingSettle | null>(null);
  const latest = useRef({ periodKey, canPrevious, canNext, onPrevious, onNext });
  const clickGuardRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    latest.current = { periodKey, canPrevious, canNext, onPrevious, onNext };
  });

  const moveTrack = useCallback((offset: number, motion: TMotion) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = motion === "none" || prefersReducedMotion() ? "none" : periodPagerMotion[motion];
    track.style.transform = offset ? `translate3d(${offset}px, 0, 0)` : "";
  }, []);

  const readOffset = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return parseTranslateX(window.getComputedStyle(track).transform || track.style.transform);
  }, []);

  const measureWidth = useCallback(() => viewportRef.current?.getBoundingClientRect().width ?? 0, []);

  const clearClickGuard = useCallback(() => clickGuardRef.current?.(), []);

  // The browser still sends the click of the finger that dragged; it must not
  // select what is under the finger. A new touch or a keyboard click is real.
  const guardNextClick = useCallback(() => {
    clickGuardRef.current?.();
    const until = performance.now() + CLICK_GUARD_MS;
    const swallow = (event: MouseEvent) => {
      if (event.detail === 0) return;
      cleanup();
      if (performance.now() > until) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const cleanup = () => {
      window.removeEventListener("click", swallow, true);
      window.clearTimeout(timer);
      if (clickGuardRef.current === cleanup) clickGuardRef.current = null;
    };
    window.addEventListener("click", swallow, true);
    const timer = window.setTimeout(cleanup, CLICK_GUARD_MS);
    clickGuardRef.current = cleanup;
  }, []);

  useEffect(() => clearClickGuard, [clearClickGuard]);

  const commit = useCallback(
    (direction: TPeriodDirection, offset: number, width: number) => {
      const { periodKey: key, onPrevious: goPrevious, onNext: goNext } = latest.current;
      const pending: TPendingSettle = {
        periodKey: key,
        fromOffset: clampOffset(direction === "next" ? offset + width : offset - width, width),
      };
      pendingRef.current = pending;
      if (direction === "next") goNext();
      else goPrevious();
      // Two frames give a state update outside React's own events time to
      // commit; a period that still has not changed was refused.
      nextFrame(() =>
        nextFrame(() => {
          if (pendingRef.current === pending) {
            pendingRef.current = null;
            moveTrack(0, "snap");
          }
        }),
      );
    },
    [moveTrack],
  );

  useLayoutEffect(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (dragRef.current?.isLocked) guardNextClick();
    dragRef.current = null;
    if (!pending || pending.periodKey === periodKey) {
      moveTrack(0, "none");
      return;
    }
    moveTrack(pending.fromOffset, "none");
    // Reading layout applies the start position before the settle begins.
    void trackRef.current?.offsetWidth;
    moveTrack(0, "settle");
  }, [periodKey, guardNextClick, moveTrack]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cancelDrag = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (drag?.isLocked) {
        guardNextClick();
        moveTrack(0, "snap");
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      clearClickGuard();
      if (dragRef.current) {
        if (event.pointerId !== dragRef.current.pointerId) cancelDrag();
        return;
      }
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      if (!event.isPrimary || !(event.target instanceof Node) || !viewport.contains(event.target)) return;
      if (event.clientX < EDGE_GUARD_PX || event.clientX > window.innerWidth - EDGE_GUARD_PX) return;
      if (isIgnoredTarget(event.target) || isDialogOpen()) return;
      const width = measureWidth();
      if (width <= 0) return;

      const baseOffset = clampOffset(readOffset(), width);
      moveTrack(baseOffset, "none");
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseOffset,
        width,
        isLocked: false,
        samples: [{ x: event.clientX, time: performance.now() }],
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (isDialogOpen()) {
        cancelDrag();
        return;
      }

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.isLocked) {
        if (Math.abs(dy) >= AXIS_LOCK_PX && Math.abs(dy) > Math.abs(dx)) {
          dragRef.current = null;
          if (drag.baseOffset) moveTrack(0, "snap");
          return;
        }
        if (Math.abs(dx) < AXIS_LOCK_PX || Math.abs(dx) <= Math.abs(dy)) return;
        drag.isLocked = true;
        try {
          viewport.setPointerCapture?.(event.pointerId);
        } catch {
          // Touch pointers are already captured by the element they started on.
        }
      }

      drag.samples = [...drag.samples.slice(-5), { x: event.clientX, time: performance.now() }];
      const { canPrevious: hasPrevious, canNext: hasNext } = latest.current;
      moveTrack(clampOffset(drag.baseOffset + resistOffset(dx, hasPrevious, hasNext), drag.width), "none");
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      if (!drag.isLocked) {
        if (drag.baseOffset) moveTrack(0, "snap");
        return;
      }

      guardNextClick();
      const dx = event.clientX - drag.startX;
      const samples = [...drag.samples, { x: event.clientX, time: performance.now() }];
      const { canPrevious: hasPrevious, canNext: hasNext } = latest.current;
      const direction = getReleaseDirection(dx, getVelocity(samples), drag.width, hasPrevious, hasNext);
      if (!direction) {
        moveTrack(0, "snap");
        return;
      }
      commit(direction, clampOffset(drag.baseOffset + dx, drag.width), drag.width);
    };

    // Touch starts captured by the element under the finger. Moving capture to
    // the viewport fires lostpointercapture on that element, and it bubbles here;
    // only a capture the viewport itself loses ends the drag.
    const handleLostCapture = (event: PointerEvent) => {
      if (event.target === viewport && dragRef.current?.pointerId === event.pointerId) cancelDrag();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    viewport.addEventListener("pointermove", handlePointerMove);
    viewport.addEventListener("pointerup", handlePointerUp);
    viewport.addEventListener("pointercancel", cancelDrag);
    viewport.addEventListener("lostpointercapture", handleLostCapture);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      viewport.removeEventListener("pointermove", handlePointerMove);
      viewport.removeEventListener("pointerup", handlePointerUp);
      viewport.removeEventListener("pointercancel", cancelDrag);
      viewport.removeEventListener("lostpointercapture", handleLostCapture);
      dragRef.current = null;
    };
  }, [clearClickGuard, commit, guardNextClick, measureWidth, moveTrack, readOffset]);

  const controls = useMemo<IPeriodPagerControls>(
    () => ({
      onPrevious: () => {
        if (dragRef.current || !latest.current.canPrevious) return;
        commit("previous", readOffset(), measureWidth());
      },
      onNext: () => {
        if (dragRef.current || !latest.current.canNext) return;
        commit("next", readOffset(), measureWidth());
      },
    }),
    [commit, measureWidth, readOffset],
  );

  return (
    <div ref={viewportRef} className={classes.viewport} data-period-pager="">
      <div ref={trackRef} className={classes.track}>
        {canPrevious ? (
          <div className={classes.previous} aria-hidden="true" inert>
            <PagerPage offset={-1} controls={NO_CONTROLS} renderPage={renderPage} />
          </div>
        ) : null}
        <div className={classes.current}>
          <PagerPage offset={0} controls={controls} renderPage={renderPage} />
        </div>
        {canNext ? (
          <div className={classes.next} aria-hidden="true" inert>
            <PagerPage offset={1} controls={NO_CONTROLS} renderPage={renderPage} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
