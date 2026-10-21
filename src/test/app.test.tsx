import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../components/app";
import { createExercise } from "../lib/db";
import { resetDatabase } from "./db-test-utils";

describe("App shell", () => {
  beforeEach(async () => {
    window.location.hash = "";
    await resetDatabase();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects an empty route to weight", async () => {
    render(<App />);

    expect(window.location.hash).toBe("#/weight");
    expect(await screen.findByText("No weigh-ins yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Weight" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("redirects an unknown route to weight", () => {
    window.location.hash = "#/nowhere";
    render(<App />);

    expect(window.location.hash).toBe("#/weight");
  });

  it("switches between modes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Exercises" }));

    expect(window.location.hash).toBe("#/exercises");
    expect(await screen.findByRole("heading", { name: "Training" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exercises" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Weight" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

type TPoint = [x: number, y: number];

const touchAt = ([x, y]: TPoint, identifier = 0) => ({ identifier, clientX: x, clientY: y });

const touchStart = (from: TPoint) =>
  fireEvent.touchStart(screen.getByRole("main"), {
    touches: [touchAt(from)],
    changedTouches: [touchAt(from)],
  });

const touchMove = (to: TPoint) =>
  fireEvent.touchMove(screen.getByRole("main"), {
    touches: [touchAt(to)],
    changedTouches: [touchAt(to)],
  });

const touchEnd = (to: TPoint) =>
  fireEvent.touchEnd(screen.getByRole("main"), { touches: [], changedTouches: [touchAt(to)] });

const swipe = (from: TPoint, to: TPoint) => {
  touchStart(from);
  touchMove(to);
  return touchEnd(to);
};

const renderAt = async (hash: string, readyText: string) => {
  window.location.hash = hash;
  render(<App />);
  await screen.findAllByText(readyText);
};

describe("Tab swipe", () => {
  beforeEach(async () => {
    window.location.hash = "";
    await resetDatabase();
  });

  afterEach(() => {
    cleanup();
  });

  it("swipes left from weight to exercises and right back", async () => {
    await renderAt("#/weight", "No weigh-ins yet");

    expect(swipe([600, 300], [480, 310])).toBe(false);
    expect(window.location.hash).toBe("#/exercises");
    await screen.findByRole("heading", { name: "Training" });

    expect(swipe([400, 300], [520, 290])).toBe(false);
    expect(window.location.hash).toBe("#/weight");
  });

  it("ignores outward swipes", async () => {
    await renderAt("#/weight", "No weigh-ins yet");
    expect(swipe([400, 300], [520, 300])).toBe(true);
    expect(window.location.hash).toBe("#/weight");

    await userEvent.setup().click(screen.getByRole("link", { name: "Exercises" }));
    await screen.findByRole("heading", { name: "Training" });
    expect(swipe([600, 300], [480, 300])).toBe(true);
    expect(window.location.hash).toBe("#/exercises");
  });

  it("ignores short, mostly vertical and edge swipes", async () => {
    await renderAt("#/weight", "No weigh-ins yet");

    swipe([600, 300], [550, 300]);
    swipe([600, 300], [520, 360]);
    swipe([window.innerWidth - 10, 300], [window.innerWidth - 200, 300]);

    expect(window.location.hash).toBe("#/weight");
  });

  it("does not revive a vertical scroll with a horizontal tail", async () => {
    await renderAt("#/weight", "No weigh-ins yet");

    touchStart([600, 300]);
    touchMove([600, 320]);
    touchMove([460, 320]);
    touchEnd([460, 320]);

    expect(window.location.hash).toBe("#/weight");
  });

  it("ignores a second finger", async () => {
    await renderAt("#/weight", "No weigh-ins yet");
    const main = screen.getByRole("main");

    touchStart([600, 300]);
    fireEvent.touchStart(main, {
      touches: [touchAt([600, 300]), touchAt([700, 400], 1)],
      changedTouches: [touchAt([700, 400], 1)],
    });
    touchEnd([460, 300]);

    expect(window.location.hash).toBe("#/weight");
  });

  it("ignores a second finger that lands outside the swipe area", async () => {
    await renderAt("#/weight", "No weigh-ins yet");
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const outside = touchAt([300, 20], 1);

    touchStart([600, 300]);
    fireEvent.touchStart(header, { touches: [touchAt([600, 300]), outside], changedTouches: [outside] });
    touchMove([460, 300]);
    fireEvent.touchEnd(main, { touches: [outside], changedTouches: [touchAt([460, 300])] });
    expect(window.location.hash).toBe("#/weight");

    touchStart([600, 300]);
    fireEvent.touchStart(header, { touches: [touchAt([600, 300]), outside], changedTouches: [outside] });
    fireEvent.touchEnd(header, { touches: [touchAt([600, 300])], changedTouches: [outside] });
    touchMove([460, 300]);
    touchEnd([460, 300]);
    expect(window.location.hash).toBe("#/weight");

    swipe([600, 300], [460, 300]);
    expect(window.location.hash).toBe("#/exercises");
  });

  it("does not switch tabs from exercise detail or settings", async () => {
    const pushUps = await createExercise({ name: "Push-ups", metric: "reps" });
    await renderAt(`#/exercises/${pushUps.id}`, "Push-ups");

    swipe([400, 300], [520, 300]);
    swipe([600, 300], [480, 300]);
    expect(window.location.hash).toBe(`#/exercises/${pushUps.id}`);

    cleanup();
    await renderAt("#/settings", "Settings");
    swipe([400, 300], [520, 300]);
    swipe([600, 300], [480, 300]);
    expect(window.location.hash).toBe("#/settings");
  });

  it("does not switch tabs while a sheet is open", async () => {
    await renderAt("#/exercises", "Training");
    await userEvent.setup().click(screen.getByRole("button", { name: "New exercise" }));
    expect(screen.getByRole("dialog", { name: "New exercise" })).toBeInTheDocument();

    swipe([400, 300], [520, 300]);

    expect(window.location.hash).toBe("#/exercises");
  });

  it("drops a gesture on touchcancel or a route change", async () => {
    await renderAt("#/weight", "No weigh-ins yet");

    touchStart([600, 300]);
    fireEvent.touchCancel(screen.getByRole("main"), { touches: [], changedTouches: [touchAt([600, 300])] });
    touchEnd([480, 300]);
    expect(window.location.hash).toBe("#/weight");

    touchStart([400, 300]);
    await userEvent.setup().click(screen.getByRole("link", { name: "Exercises" }));
    await screen.findByRole("heading", { name: "Training" });
    touchEnd([520, 300]);
    expect(window.location.hash).toBe("#/exercises");

    swipe([400, 300], [520, 300]);
    expect(window.location.hash).toBe("#/weight");
  });
});
