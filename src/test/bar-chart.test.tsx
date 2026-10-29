import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BarChart, BarSparkline } from "../components/charts";

afterEach(cleanup);

const bars = [
  { date: "2026-10-15", value: 10 },
  { date: "2026-10-19", value: 30 },
];

const renderChart = (selectedDate: string | null, onSelect = vi.fn()) => {
  render(<BarChart
    bars={bars}
    startKey="2026-10-15"
    endKey="2026-10-19"
    stepDays={1}
    xLabels={[]}
    selectedDate={selectedDate}
    onSelect={onSelect}
    formatValue={String}
    unit="reps"
    label="Push-ups"
  />);
  return onSelect;
};

const barRects = (container: ParentNode) =>
  Array.from(container.querySelectorAll("svg > rect")).map((rect) => ({
    x: Number(rect.getAttribute("x")),
    y: Number(rect.getAttribute("y")),
    width: Number(rect.getAttribute("width")),
    height: Number(rect.getAttribute("height")),
    className: rect.getAttribute("class") ?? "",
  }));

describe("BarChart", () => {
  it("draws one bar per logged day from a zero baseline and leaves empty days blank", () => {
    renderChart("2026-10-19");
    const figure = screen.getByRole("figure", { name: /Push-ups/ });
    const rects = barRects(figure);

    expect(rects).toHaveLength(2);
    expect(rects[0].y + rects[0].height).toBeCloseTo(rects[1].y + rects[1].height);
    expect(rects[1].height / rects[0].height).toBeCloseTo(3);
    // Five day slots: Oct 19 sits four slots to the right of Oct 15.
    expect((rects[1].x - rects[0].x) / (292 / 5)).toBeCloseTo(4);
    expect(rects[1].className).toContain("fill-ink");
    expect(rects[0].className).toContain("fill-muted");
    expect(Array.from(figure.querySelectorAll("text")).map((node) => node.textContent)).toContain("0");
  });

  it("selects bars by tap and arrow keys", () => {
    const onSelect = renderChart("2026-10-19");

    fireEvent.click(screen.getByTestId("chart-bar-2026-10-15"));
    expect(onSelect).toHaveBeenLastCalledWith("2026-10-15");
    fireEvent.keyDown(screen.getByRole("figure"), { key: "ArrowLeft" });
    expect(onSelect).toHaveBeenLastCalledWith("2026-10-15");
    fireEvent.keyDown(screen.getByRole("figure"), { key: "ArrowRight" });
    expect(onSelect).toHaveBeenLastCalledWith("2026-10-19");
    expect(screen.queryByTestId("chart-bar-2026-10-16")).toBeNull();
  });
});

describe("BarSparkline", () => {
  it("renders nothing for no data", () => {
    const { container } = render(<BarSparkline bars={[]} startKey="2026-10-15" endKey="2026-10-19" stepDays={1} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("draws passive bars on real day slots", () => {
    const { container } = render(<BarSparkline bars={bars} startKey="2026-10-15" endKey="2026-10-19" stepDays={1} />);
    const svg = container.querySelector("svg")!;
    const rects = barRects(container);

    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(rects).toHaveLength(2);
    expect(rects[1].x - rects[0].x).toBeCloseTo((340 / 5) * 4);
    expect(rects[1].height).toBeGreaterThan(rects[0].height);
  });
});
