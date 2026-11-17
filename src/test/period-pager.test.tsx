import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PeriodPager, type IPeriodPagerProps } from "../components/period-pager";

const WIDTH = 300;

let now = 0;

type THarnessProps = {
  min?: number;
  max?: number;
  refuse?: boolean;
  onPoint?: () => void;
  onMove?: (direction: "previous" | "next") => void;
};

function Harness({ min = -3, max = 0, refuse = false, onPoint = () => {}, onMove = () => {} }: THarnessProps) {
  const [index, setIndex] = useState(0);
  const move = (step: -1 | 1) => {
    onMove(step < 0 ? "previous" : "next");
    if (!refuse) setIndex((value) => value + step);
  };
  return (
    <PeriodPager
      periodKey={String(index)}
      canPrevious={index > min}
      canNext={index < max}
      onPrevious={() => move(-1)}
      onNext={() => move(1)}
      renderPage={(offset, controls) => (
        <section aria-label={`Period ${index + offset}`}>
          <h2>Period {index + offset}</h2>
          <button type="button" onClick={controls.onPrevious}>Previous</button>
          <button type="button" onClick={controls.onNext}>Next</button>
          <svg>
            <circle data-testid={`point ${index + offset}`} onClick={onPoint} />
          </svg>
          <input aria-label={`Field ${index + offset}`} />
        </section>
      )}
    />
  );
}

const viewport = () => document.querySelector<HTMLElement>("[data-period-pager]")!;
const track = () => viewport().firstElementChild as HTMLElement;
const heading = () => screen.getByRole("heading").textContent;
const point = (period = 0) => screen.getByTestId(`point ${period}`);

type TPointer = { x: number; y?: number; id?: number; pointerType?: string; isPrimary?: boolean };

const pointer = (
  type: "pointerDown" | "pointerMove" | "pointerUp" | "pointerCancel",
  target: Element,
  { x, y = 100, id = 1, pointerType = "touch", isPrimary = true }: TPointer,
) => fireEvent[type](target, { pointerId: id, clientX: x, clientY: y, pointerType, isPrimary });

/** Drags through `[x, ms since start]` steps; the last one is the release. */
const drag = (target: Element, steps: [number, number][], y = 100) => {
  const start = now;
  const [first, ...rest] = steps;
  now = start + first[1];
  pointer("pointerDown", target, { x: first[0], y });
  rest.forEach(([x, time], index) => {
    now = start + time;
    pointer(index === rest.length - 1 ? "pointerUp" : "pointerMove", target, { x, y });
  });
};

const setWidth = (width: number) =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width } as DOMRect);

beforeEach(() => {
  now = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  setWidth(WIDTH);
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.querySelectorAll("dialog").forEach((dialog) => dialog.remove());
});

describe("PeriodPager layout", () => {
  it("renders only allowed neighbours, hidden and inert", () => {
    render(<Harness />);

    expect(heading()).toBe("Period 0");
    const previous = screen.getByText("Period -1").closest("[inert]");
    expect(previous).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText("Period 1")).toBeNull();
    expect(screen.getAllByRole("button", { name: "Next" })).toHaveLength(1);
  });

  it("moves with the arrows without waiting for a running slide", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(heading()).toBe("Period -2");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(heading()).toBe("Period -1");
    expect(onMove.mock.calls).toEqual([["previous"], ["previous"], ["next"]]);
  });

  it("ignores an arrow toward a missing period", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onMove).not.toHaveBeenCalled();
    expect(heading()).toBe("Period 0");
  });
});

describe("PeriodPager dragging", () => {
  it("follows the finger and moves past a quarter of the width", () => {
    render(<Harness />);

    pointer("pointerDown", point(), { x: 100 });
    now += 200;
    pointer("pointerMove", point(), { x: 150 });
    expect(track().style.transform).toBe("translate3d(50px, 0, 0)");
    expect(track().style.transition).toBe("none");

    now += 200;
    pointer("pointerUp", point(), { x: 200 });
    expect(heading()).toBe("Period -1");
    expect(track().style.transform).toBe("");
    expect(track().style.transition).toContain("--pager-settle-duration");
  });

  it("snaps back after a short slow drag", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    drag(point(), [[100, 0], [140, 300], [150, 600]]);
    expect(onMove).not.toHaveBeenCalled();
    expect(track().style.transform).toBe("");
    expect(track().style.transition).toContain("--pager-snap-duration");
  });

  it("moves after a quick flick in the same direction", () => {
    render(<Harness />);

    drag(point(), [[100, 0], [115, 10], [130, 20]]);
    expect(heading()).toBe("Period -1");
  });

  it("does not move when the flick turns against the drag", () => {
    const onMove = vi.fn();
    render(<Harness min={-3} max={3} onMove={onMove} />);

    drag(point(), [[200, 0], [140, 300], [170, 330]]);
    expect(onMove).not.toHaveBeenCalled();
  });

  it("stays still toward a missing period and follows a reversal immediately", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    pointer("pointerDown", point(), { x: 250 });
    pointer("pointerMove", point(), { x: 150 });
    expect(track().style.transform).toBe("");
    pointer("pointerMove", point(), { x: 50 });
    expect(track().style.transform).toBe("");
    pointer("pointerMove", point(), { x: 100 });
    expect(track().style.transform).toBe("translate3d(50px, 0, 0)");
    pointer("pointerUp", point(), { x: 150 });
    expect(heading()).toBe("Period -1");
    expect(onMove).toHaveBeenCalledExactlyOnceWith("previous");
  });

  it.each([
    ["future", -3, 0, 250, 100, 150, 250, "Period -1"],
    ["past", 0, 3, 100, 250, 250, 100, "Period 1"],
  ] as const)("recovers immediately from the %s boundary", (_side, min, max, start, end, reverseStart, reverseEnd, expected) => {
    const onMove = vi.fn();
    render(<Harness min={min} max={max} onMove={onMove} />);

    drag(point(), [[start, 0], [end, 150], [end, 300]]);
    expect(onMove).not.toHaveBeenCalled();
    expect(track().style.transform).toBe("");
    drag(point(), [[reverseStart, 0], [(reverseStart + reverseEnd) / 2, 150], [reverseEnd, 300]]);
    expect(heading()).toBe(expected);
  });

  it.each(["pointerUp", "pointerCancel"] as const)("cleans up a %s outside the pager", (type) => {
    render(<Harness />);
    pointer("pointerDown", point(), { x: 250 });
    pointer("pointerMove", point(), { x: 150 });
    pointer(type, document.body, { x: 150 });

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(heading()).toBe("Period -1");
    drag(point(-1), [[100, 0], [200, 150], [220, 300]]);
    expect(heading()).toBe("Period -2");
  });

  it.each([1, 2])("recovers a stale drag when a fresh primary pointer %s starts", (id) => {
    render(<Harness />);
    pointer("pointerDown", point(), { x: 250 });
    pointer("pointerMove", point(), { x: 150 });

    pointer("pointerDown", point(), { x: 100, id });
    pointer("pointerMove", point(), { x: 200, id });
    pointer("pointerUp", point(), { x: 220, id });
    expect(heading()).toBe("Period -1");
  });

  it.each(["blur", "pagehide", "hidden"])("cleans up when the app is interrupted by %s", (reason) => {
    render(<Harness />);
    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 150 });
    if (reason === "hidden") {
      vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
      fireEvent(document, new Event("visibilitychange"));
    } else fireEvent(window, new Event(reason));
    expect(track().style.transform).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(heading()).toBe("Period -1");
  });

  it("ignores ending events from another pointer", () => {
    render(<Harness />);
    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 150 });
    pointer("pointerUp", document.body, { x: 150, id: 2, isPrimary: false });
    pointer("pointerCancel", document.body, { x: 150, id: 2, isPrimary: false });
    pointer("pointerUp", document.body, { x: 220 });
    expect(heading()).toBe("Period -1");
  });

  it("does not let a refused older navigation snap a new drag back", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame"] });
    render(<Harness refuse />);
    drag(point(), [[100, 0], [200, 150], [220, 300]]);
    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 130 });
    const offset = track().style.transform;
    act(() => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });
    expect(track().style.transform).toBe(offset);
    pointer("pointerCancel", document.body, { x: 130 });
  });

  it("swallows the click after a drag but not after a tap", () => {
    const onPoint = vi.fn();
    render(<Harness onPoint={onPoint} />);

    drag(point(), [[100, 0], [120, 300], [130, 600]]);
    fireEvent.click(point(), { detail: 1 });
    expect(onPoint).not.toHaveBeenCalled();

    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerUp", point(), { x: 102 });
    fireEvent.click(point(), { detail: 1 });
    expect(onPoint).toHaveBeenCalledOnce();
  });

  it("lets a new tap or a keyboard click through right after a swipe", () => {
    const onMove = vi.fn();
    const onPoint = vi.fn();
    render(<Harness min={-5} max={3} onMove={onMove} onPoint={onPoint} />);

    drag(point(), [[100, 0], [180, 150], [250, 300]]);
    expect(onMove).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }), { detail: 0 });
    expect(onMove).toHaveBeenCalledTimes(2);
    fireEvent.click(point(-2), { detail: 1 });
    expect(onPoint).not.toHaveBeenCalled();

    drag(point(-2), [[100, 0], [180, 150], [250, 300]]);
    const previous = screen.getByRole("button", { name: "Previous" });
    pointer("pointerDown", previous, { x: 60 });
    pointer("pointerUp", previous, { x: 60 });
    fireEvent.click(previous, { detail: 1 });
    expect(onMove).toHaveBeenCalledTimes(4);
  });

  it("lets vertical scrolling win once it starts", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    pointer("pointerDown", point(), { x: 100, y: 100 });
    pointer("pointerMove", point(), { x: 103, y: 130 });
    pointer("pointerMove", point(), { x: 250, y: 140 });
    expect(track().style.transform).toBe("");
    pointer("pointerUp", point(), { x: 250, y: 140 });
    expect(onMove).not.toHaveBeenCalled();
  });

  it.each([
    ["the screen edge", () => drag(point(), [[10, 0], [100, 150], [200, 300]])],
    ["a button", () => drag(screen.getByRole("button", { name: "Previous" }), [[100, 0], [180, 150], [250, 300]])],
    ["a form field", () => drag(screen.getByRole("textbox"), [[100, 0], [180, 150], [250, 300]])],
  ])("ignores drags that start at %s", (_place, run) => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    run();
    expect(onMove).not.toHaveBeenCalled();
    expect(track().style.transform).toBe("");
  });

  it("ignores mouse drags and drags while a dialog is open", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    pointer("pointerDown", point(), { x: 100, pointerType: "mouse" });
    pointer("pointerMove", point(), { x: 250, pointerType: "mouse" });
    pointer("pointerUp", point(), { x: 250, pointerType: "mouse" });

    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    document.body.append(dialog);
    drag(point(), [[100, 0], [180, 150], [250, 300]]);

    expect(onMove).not.toHaveBeenCalled();
  });

  it("cancels when a dialog opens during the drag", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 150 });
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    document.body.append(dialog);
    pointer("pointerMove", point(), { x: 200 });
    pointer("pointerUp", point(), { x: 250 });

    expect(onMove).not.toHaveBeenCalled();
    expect(track().style.transform).toBe("");
  });

  it.each([
    ["a second finger", () => pointer("pointerDown", document.body, { x: 500, id: 2, isPrimary: false })],
    ["pointer cancel", () => pointer("pointerCancel", point(), { x: 160 })],
    ["lost capture", () => fireEvent(viewport(), new PointerEvent("lostpointercapture", { pointerId: 1 }))],
  ])("cancels the drag on %s", (_reason, cancel) => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 160 });
    cancel();
    expect(track().style.transform).toBe("");
    pointer("pointerUp", point(), { x: 250 });

    expect(onMove).not.toHaveBeenCalled();
    expect(heading()).toBe("Period 0");
  });

  it("keeps the drag when capture moves from the touched element to the pager", () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 160 });
    fireEvent(point(), new PointerEvent("lostpointercapture", { pointerId: 1, bubbles: true }));
    fireEvent(viewport(), new PointerEvent("gotpointercapture", { pointerId: 1 }));
    pointer("pointerMove", viewport(), { x: 200 });
    expect(track().style.transform).toBe("translate3d(100px, 0, 0)");
    pointer("pointerUp", viewport(), { x: 250 });

    expect(onMove).toHaveBeenCalledWith("previous");
    expect(heading()).toBe("Period -1");
  });

  it("does not track drags while the width is unknown", () => {
    setWidth(0);
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);

    drag(point(), [[100, 0], [180, 150], [250, 300]]);
    expect(onMove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(heading()).toBe("Period -1");
  });

  it("snaps back when the page refuses the move", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame"] });
    const onMove = vi.fn();
    render(<Harness refuse onMove={onMove} />);

    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 200 });
    pointer("pointerUp", point(), { x: 220 });
    expect(onMove).toHaveBeenCalledWith("previous");
    expect(track().style.transform).toBe("translate3d(100px, 0, 0)");

    act(() => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });
    expect(track().style.transform).toBe("");
    expect(track().style.transition).toContain("--pager-snap-duration");
  });

  it("drops a drag when the period changes from outside", () => {
    const onPrevious = vi.fn();
    const props: IPeriodPagerProps = {
      periodKey: "a",
      canPrevious: true,
      canNext: false,
      onPrevious,
      onNext: () => {},
      renderPage: (offset) => <p data-testid={`page ${offset}`}>Page {offset}</p>,
    };
    const { rerender } = render(<PeriodPager {...props} />);
    const page = screen.getByTestId("page 0");

    pointer("pointerDown", page, { x: 100 });
    pointer("pointerMove", page, { x: 160 });
    rerender(<PeriodPager {...props} periodKey="b" />);
    expect(track().style.transform).toBe("");
    pointer("pointerUp", page, { x: 250 });
    const onClick = vi.fn();
    document.addEventListener("click", onClick);
    fireEvent.click(page, { detail: 1 });
    document.removeEventListener("click", onClick);

    expect(onPrevious).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("starts an interrupting slide at most one page away", () => {
    render(<Harness min={-3} max={3} />);
    const element = track();
    const transforms: string[] = [];
    let transform = "translate3d(250px, 0, 0)";
    Object.defineProperty(element.style, "transform", {
      configurable: true,
      get: () => transform,
      set: (value: string) => {
        transform = value;
        transforms.push(value);
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(heading()).toBe("Period 1");
    expect(transforms).toEqual(["translate3d(300px, 0, 0)", ""]);

    transforms.length = 0;
    transform = "translate3d(250px, 0, 0)";
    pointer("pointerDown", point(1), { x: 180 });
    pointer("pointerMove", point(1), { x: 100 });
    expect(transforms.at(-1)).toBe("translate3d(170px, 0, 0)");
    pointer("pointerUp", point(1), { x: 100 });
    expect(heading()).toBe("Period 2");
    expect(transforms.slice(-2)).toEqual(["translate3d(300px, 0, 0)", ""]);

    transforms.length = 0;
    transform = "translate3d(250px, 0, 0)";
    pointer("pointerDown", point(2), { x: 100 });
    pointer("pointerMove", point(2), { x: 180 });
    expect(transforms.at(-1)).toBe("translate3d(300px, 0, 0)");
    pointer("pointerCancel", point(2), { x: 180 });
  });

  it("follows the finger but skips the slide under reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") }));
    render(<Harness />);

    pointer("pointerDown", point(), { x: 100 });
    pointer("pointerMove", point(), { x: 180 });
    expect(track().style.transform).toBe("translate3d(80px, 0, 0)");
    pointer("pointerUp", point(), { x: 200 });

    expect(heading()).toBe("Period -1");
    expect(track().style.transition).toBe("none");
    expect(track().style.transform).toBe("");
  });
});
