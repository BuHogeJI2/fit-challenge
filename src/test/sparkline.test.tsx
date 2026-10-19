import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Sparkline } from "../components/charts/sparkline";

afterEach(cleanup);

describe("Sparkline", () => {
  it("renders nothing for no data", () => {
    const { container } = render(<Sparkline points={[]} startKey="2026-10-01" endKey="2026-10-19" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("shows a single dot without drawing a line", () => {
    const { container } = render(<Sparkline
      points={[{ date: "2026-10-19", value: 29 }]}
      startKey="2026-10-19"
      endKey="2026-10-19"
    />);
    const dot = container.querySelector("circle")!;
    expect(dot.getAttribute("cx")).toBe("171");
    expect(Number(dot.getAttribute("cy"))).toBeCloseTo(16);
    expect(container.querySelector("polyline")).toBeNull();
  });

  it("uses real date spacing and preserves gaps in a full-width passive SVG", () => {
    const { container } = render(<Sparkline
      points={[
        { date: "2026-10-01", value: 10 },
        { date: "2026-10-02", value: 20 },
        { date: "2026-10-11", value: 30 },
      ]}
      startKey="2026-10-01"
      endKey="2026-10-11"
    />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 342 32");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
    expect(svg.getAttribute("class")).toContain("w-full");
    const points = container.querySelector("polyline")!.getAttribute("points")!
      .split(" ").map((pair) => pair.split(",").map(Number));
    expect(points).toHaveLength(3);
    expect((points[1][0] - points[0][0]) / (points[2][0] - points[0][0])).toBeCloseTo(0.1);
    expect(points[0][1]).toBeGreaterThan(points[2][1]);
  });

  it("keeps a flat series readable and sorts without mutating its input", () => {
    const points = [
      { date: "2026-10-19", value: 29 },
      { date: "2026-10-01", value: 29 },
    ];
    const { container } = render(<Sparkline points={points} startKey="2026-10-01" endKey="2026-10-19" />);
    const pairs = container.querySelector("polyline")!.getAttribute("points")!
      .split(" ").map((pair) => pair.split(",").map(Number));
    expect(pairs[0][0]).toBeLessThan(pairs[1][0]);
    expect(pairs[0][1]).toBeCloseTo(16);
    expect(pairs[1][1]).toBeCloseTo(16);
    expect(points[0].date).toBe("2026-10-19");
  });
});
