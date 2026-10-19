import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UpdateBanner } from "../components/update-banner";

const updateServiceWorker = vi.fn(async () => {});

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({
    needRefresh: useState(true),
    offlineReady: useState(false),
    updateServiceWorker,
  }),
}));

describe("UpdateBanner", () => {
  afterEach(() => {
    cleanup();
    updateServiceWorker.mockClear();
  });

  it("reloads into the new version only when asked", async () => {
    const user = userEvent.setup();
    render(<UpdateBanner />);

    expect(screen.getByText("A new version of Fit is ready.")).toBeInTheDocument();
    expect(updateServiceWorker).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Reload" }));
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("hides until the next update when postponed", async () => {
    const user = userEvent.setup();
    render(<UpdateBanner />);

    await user.click(screen.getByRole("button", { name: "Later" }));

    expect(screen.queryByText("A new version of Fit is ready.")).not.toBeInTheDocument();
    expect(updateServiceWorker).not.toHaveBeenCalled();
  });
});
