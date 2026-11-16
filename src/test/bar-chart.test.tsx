import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BarChart, TrainingDaysChart } from "../components/charts";

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

describe("TrainingDaysChart", () => {
  const days = [
    { date: "2026-10-12", count: 1 },
    { date: "2026-10-13", count: 0 },
    { date: "2026-10-14", count: 2 },
    { date: "2026-10-15", count: 0 },
    { date: "2026-10-16", count: 0 },
    { date: "2026-10-17", count: 0 },
    { date: "2026-10-18", count: 0 },
  ];

  it("prints whole counts over bars and names every day", () => {
    render(<TrainingDaysChart days={days} todayKey="2026-10-15" />);

    expect(screen.getByRole("img")).toHaveAccessibleName("Trainings per day: Mon 1, Tue 0, Wed 2, Thu 0, Fri 0, Sat 0, Sun 0");
    const monday = screen.getByTestId("training-day-2026-10-12");
    const wednesday = screen.getByTestId("training-day-2026-10-14");
    expect(monday.querySelector("text")).toHaveTextContent("1");
    expect(Number(wednesday.querySelector("rect")?.getAttribute("height"))).toBe(2 * Number(monday.querySelector("rect")?.getAttribute("height")));
  });

  it("marks past empty days and leaves later days blank", () => {
    render(<TrainingDaysChart days={days} todayKey="2026-10-15" />);

    const today = screen.getByTestId("training-day-2026-10-15");
    const later = screen.getByTestId("training-day-2026-10-16");
    expect(today.querySelector("rect")).toBeNull();
    expect(today.querySelector("path")).not.toBeNull();
    expect(later.querySelector("path")).toBeNull();
  });
});
