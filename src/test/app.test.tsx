import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../components/app";

describe("App shell", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects an empty route to weight", () => {
    render(<App />);

    expect(window.location.hash).toBe("#/weight");
    expect(screen.getByRole("heading", { name: "Weight" })).toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: "Training" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exercises" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Weight" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
