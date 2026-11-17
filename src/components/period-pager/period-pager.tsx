import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { periodPagerClasses as classes, getTrackClassName } from "./period-pager.styles";
import type { IPagerPageProps, IPeriodPagerControls, IPeriodPagerProps, TPeriodOffset } from "./period-pager.types";
import { canDragPeriod, prefersReducedMotion } from "./period-pager.utils";

const NO_CONTROLS: IPeriodPagerControls = { onPrevious: () => {}, onNext: () => {} };

function PagerPage({ offset, controls, renderPage }: IPagerPageProps) {
  return renderPage(offset, controls);
}

/** Slides complete periods using native touch handling; commits a new period after settling. */
export function PeriodPager({ periodKey, canPrevious, canNext, onPrevious, onNext, renderPage }: IPeriodPagerProps) {
  const [initialIndex] = useState(canPrevious ? 1 : 0);
  const [emblaRef, api] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: false,
    align: "start",
    containScroll: "keepSnaps",
    skipSnaps: false,
    watchDrag: canDragPeriod,
    watchFocus: false,
    watchResize: false,
    watchSlides: false,
  });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ periodKey, canPrevious, canNext, onPrevious, onNext });
  const dragging = useRef(false);
  const pending = useRef(false);
  const touched = useRef(false);
  const refusalFrame = useRef(0);
  const currentIndex = canPrevious ? 1 : 0;

  useLayoutEffect(() => {
    latest.current = { periodKey, canPrevious, canNext, onPrevious, onNext };
  });

  const cancelRefusal = useCallback(() => {
    cancelAnimationFrame(refusalFrame.current);
    pending.current = false;
  }, []);

  const reset = useCallback(() => {
    cancelRefusal();
    dragging.current = false;
    touched.current = false;
    api?.reInit({ startIndex: latest.current.canPrevious ? 1 : 0 });
  }, [api, cancelRefusal]);

  // Recenter only after React has replaced the settled period, never during a drag.
  useLayoutEffect(reset, [reset, periodKey, canPrevious, canNext]);

  useEffect(() => {
    if (!api) return;
    let active = true;
    const commit = () => {
      if (dragging.current || pending.current) return;
      const state = latest.current;
      const index = state.canPrevious ? 1 : 0;
      const selected = api.selectedScrollSnap();
      if (selected === index) {
        if (touched.current) {
          touched.current = false;
          queueMicrotask(() => {
            if (active && !dragging.current && !pending.current && latest.current.periodKey === state.periodKey) reset();
          });
        }
        return;
      }
      pending.current = true;
      if (selected < index && state.canPrevious) state.onPrevious();
      else if (selected > index && state.canNext) state.onNext();
      refusalFrame.current = requestAnimationFrame(() => {
        if (pending.current && latest.current.periodKey === state.periodKey) {
          api.scrollTo(index, true);
          pending.current = false;
        }
      });
    };
    const down = () => {
      cancelRefusal();
      dragging.current = true;
      touched.current = true;
    };
    const up = () => {
      dragging.current = false;
      if (prefersReducedMotion()) {
        api.scrollTo(api.selectedScrollSnap(), true);
        commit();
      }
    };
    // Embla emits settle before updating its index for zero-duration jumps.
    const reducedSelect = () => {
      if (prefersReducedMotion()) commit();
    };
    const hidden = () => {
      if (document.visibilityState === "hidden") reset();
    };
    api.on("pointerDown", down).on("pointerUp", up).on("settle", commit).on("select", reducedSelect);
    window.addEventListener("blur", reset);
    window.addEventListener("pagehide", reset);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      active = false;
      api.off("pointerDown", down).off("pointerUp", up).off("settle", commit).off("select", reducedSelect);
      window.removeEventListener("blur", reset);
      window.removeEventListener("pagehide", reset);
      document.removeEventListener("visibilitychange", hidden);
      cancelRefusal();
    };
  }, [api, reset, cancelRefusal]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const current = currentRef.current;
    if (!viewport || !current) return;
    let width = viewport.getBoundingClientRect().width;
    const measure = () => {
      viewport.style.height = `${current.getBoundingClientRect().height}px`;
      const nextWidth = viewport.getBoundingClientRect().width;
      if (nextWidth !== width) {
        width = nextWidth;
        reset();
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(current);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [reset]);

  const controls = useMemo<IPeriodPagerControls>(() => {
    const go = (offset: -1 | 1) => {
      const state = latest.current;
      if (dragging.current || pending.current || (offset < 0 ? !state.canPrevious : !state.canNext)) return;
      if (api) api.scrollTo((state.canPrevious ? 1 : 0) + offset, prefersReducedMotion());
      else if (offset < 0) state.onPrevious();
      else state.onNext();
    };
    return { onPrevious: () => go(-1), onNext: () => go(1) };
  }, [api]);

  const setViewport = useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node;
    emblaRef(node);
  }, [emblaRef]);
  const offsets: TPeriodOffset[] = [...(canPrevious ? [-1 as const] : []), 0, ...(canNext ? [1 as const] : [])];

  return <div ref={setViewport} className={classes.viewport} data-period-pager="" data-carousel-ready={api ? "" : undefined}>
    <div className={getTrackClassName(!api && currentIndex > 0)}>
      {offsets.map((offset) => <div key={offset} ref={offset === 0 ? currentRef : undefined} className={classes.page} aria-hidden={offset !== 0 ? true : undefined} inert={offset !== 0 ? true : undefined} data-period-current={offset === 0 ? "" : undefined}>
        <PagerPage offset={offset} controls={offset === 0 ? controls : NO_CONTROLS} renderPage={renderPage} />
      </div>)}
    </div>
  </div>;
}
