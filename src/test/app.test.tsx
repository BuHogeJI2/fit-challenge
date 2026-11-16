import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../components/app";
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
    expect(await screen.findByRole("group", { name: "Training view" })).toBeInTheDocument();
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

describe("Section swipe boundaries", () => {
  beforeEach(async () => {
    window.location.hash = "";
    await resetDatabase();
  });

  afterEach(() => cleanup());

  it("uses top tabs for sections and ignores swipes on main content", async () => {
    await renderAt("#/weight", "No weigh-ins yet");
    swipe([600, 300], [480, 310]);
    expect(window.location.hash).toBe("#/weight");
    await userEvent.setup().click(screen.getByRole("link", { name: "Exercises" }));
    await screen.findByRole("group", { name: "Training view" });
    swipe([400, 300], [520, 290]);
    expect(window.location.hash).toBe("#/exercises");
    await userEvent.setup().click(screen.getByRole("link", { name: "Weight" }));
    expect(await screen.findByText("No weigh-ins yet")).toBeInTheDocument();
  });
});
