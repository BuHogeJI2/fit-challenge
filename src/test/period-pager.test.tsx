import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PeriodPager } from "../components/period-pager";
import { canDragPeriod } from "../components/period-pager/period-pager.utils";

const engine = vi.hoisted(() => {
  const listeners = new Map<string, Set<() => void>>();
  let index = 1;
  const api = {
    reInit: vi.fn((options: { startIndex: number }) => { index = options.startIndex; }),
    selectedScrollSnap: () => index,
    scrollTo: vi.fn((next: number, jump = false) => {
      if (jump) listeners.get("settle")?.forEach((listener) => listener());
      index = next;
      if (jump) listeners.get("select")?.forEach((listener) => listener());
    }),
    on: vi.fn((event: string, listener: () => void) => { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event)!.add(listener); return api; }),
    off: vi.fn((event: string, listener: () => void) => { listeners.get(event)?.delete(listener); return api; }),
  };
  return { api, ref: () => {}, emit: (event: string) => listeners.get(event)?.forEach((listener) => listener()), select: (next: number) => { index = next; } };
});
vi.mock("embla-carousel-react", () => ({ default: () => [engine.ref, engine.api] }));

function Harness({ refuse = false, onMove = () => {} }: { refuse?: boolean; onMove?: () => void }) {
  const [period, setPeriod] = useState(0);
  return <PeriodPager periodKey={String(period)} canPrevious={period > -2} canNext={period < 0} onPrevious={() => { onMove(); if (!refuse) setPeriod((value) => value - 1); }} onNext={() => { if (!refuse) setPeriod((value) => value + 1); }} renderPage={(offset, controls) => <>
    <h1>Period {period + offset}</h1><button onClick={controls.onPrevious}>Previous</button><button onClick={controls.onNext}>Next</button><a href="#detail">Row</a>
  </>} />;
}
const heading = () => screen.getByRole("heading").textContent;
const emit = (event: string) => act(() => engine.emit(event));

beforeEach(() => { vi.clearAllMocks(); engine.select(1); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe("period carousel adapter", () => {
  it("keeps neighbors inaccessible and includes the whole row in the slide", () => {
    render(<Harness />);
    expect(heading()).toBe("Period 0");
    expect(screen.getByText("Period -1").closest("[inert]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText("Period 1")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link").closest("[data-period-current]")).not.toBeNull();
  });

  it("commits once after settling, never while the finger is down, then recenters", () => {
    render(<Harness />);
    emit("pointerDown"); engine.select(0); emit("settle");
    expect(heading()).toBe("Period 0");
    emit("pointerUp"); emit("settle");
    expect(heading()).toBe("Period -1");
    expect(engine.api.reInit).toHaveBeenLastCalledWith({ startIndex: 1 });
    emit("settle");
    expect(heading()).toBe("Period -1");
  });

  it("uses arrows through Embla and recovers after a boundary then repeated periods", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(engine.api.scrollTo).not.toHaveBeenCalled();
    emit("pointerDown"); emit("pointerUp"); emit("settle");
    for (let attempt = 0; attempt < 3; attempt++) {
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(engine.api.scrollTo).toHaveBeenLastCalledWith(0, false);
      emit("settle"); expect(heading()).toBe("Period -1");
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      emit("settle"); expect(heading()).toBe("Period 0");
    }
  });

  it("recenters to index zero at the oldest period", () => {
    render(<Harness />);
    engine.select(0); emit("settle");
    engine.select(0); emit("settle");
    expect(heading()).toBe("Period -2");
    expect(engine.api.reInit).toHaveBeenLastCalledWith({ startIndex: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Next" })); emit("settle");
    expect(heading()).toBe("Period -1");
  });

  it("snaps back if a parent refuses navigation and permits a new attempt", () => {
    vi.useFakeTimers();
    const onMove = vi.fn();
    render(<Harness refuse onMove={onMove} />);
    engine.select(0); emit("settle");
    act(() => vi.runAllTimers());
    expect(heading()).toBe("Period 0");
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(engine.api.scrollTo).toHaveBeenLastCalledWith(1, true);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(engine.api.scrollTo).toHaveBeenLastCalledWith(0, false);
  });

  it("resets interruptions and unsubscribes on unmount", () => {
    const result = render(<Harness />);
    emit("pointerDown"); engine.select(0);
    fireEvent(window, new Event("pagehide"));
    expect(engine.api.reInit).toHaveBeenLastCalledWith({ startIndex: 1 });
    emit("settle"); expect(heading()).toBe("Period 0");
    result.unmount();
    expect(engine.api.off).toHaveBeenCalledTimes(4);
  });

  it("jumps to the released selection without automatic motion when reduced motion is set", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<Harness />);
    emit("pointerDown"); engine.select(0); emit("pointerUp");
    expect(engine.api.scrollTo).toHaveBeenLastCalledWith(0, true);
    expect(heading()).toBe("Period -1");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(engine.api.scrollTo).toHaveBeenLastCalledWith(2, true);
  });
});

describe("touch area", () => {
  const allowed = (element: Element, type = "touchstart") => canDragPeriod(undefined, { target: element, type } as unknown as TouchEvent);
  it("allows rows, links, buttons and chart points", () => {
    for (const tag of ["a", "button", "div", "circle"]) expect(allowed(document.createElement(tag))).toBe(true);
  });
  it("leaves fields, explicit controls, disclosure and mouse input alone", () => {
    for (const tag of ["input", "textarea", "select", "summary"]) expect(allowed(document.createElement(tag))).toBe(false);
    const control = document.createElement("button"); control.dataset.pagerIgnore = "";
    expect(allowed(control)).toBe(false);
    expect(allowed(document.createElement("div"), "mousedown")).toBe(false);
    const editable = document.createElement("div"); editable.setAttribute("contenteditable", "true");
    expect(allowed(editable)).toBe(false);
  });
  it("blocks background drags while a dialog is open", () => {
    const dialog = document.createElement("dialog"); dialog.open = true; document.body.append(dialog);
    expect(allowed(document.createElement("a"))).toBe(false);
    dialog.remove();
  });
});
