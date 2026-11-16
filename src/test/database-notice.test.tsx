import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Dexie from "dexie";
import { DatabaseGate } from "../components/database-gate";
import { ToastProvider } from "../components/ui";
import { db } from "../lib/db";
import { resetDatabase } from "./db-test-utils";

const notice = vi.hoisted(() => ({
  current: null as "updated_elsewhere" | "upgrade_blocked" | null,
  listener: null as ((value: "updated_elsewhere" | "upgrade_blocked") => void) | null,
}));

vi.mock("../lib/db", async (importOriginal) => ({
  ...await importOriginal<typeof import("../lib/db")>(),
  getDatabaseNotice: () => notice.current,
  subscribeDatabaseNotice: (listener: typeof notice.listener) => {
    notice.listener = listener;
    return () => { notice.listener = null; };
  },
}));

describe("database update notices", () => {
  beforeEach(async () => {
    notice.current = null;
    await resetDatabase();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("replaces the screen with a reload message without deleting saved data", async () => {
    await db.settings.put({ key: "goalWeightKg", value: 80 });
    render(<ToastProvider><DatabaseGate><p>Journal ready</p></DatabaseGate></ToastProvider>);
    await screen.findByText("Journal ready");
    act(() => {
      notice.current = "updated_elsewhere";
      notice.listener?.("updated_elsewhere");
    });
    expect(await screen.findByRole("heading", { name: "Fit was updated" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
    expect(screen.queryByText("Journal ready")).toBeNull();
    expect(await db.settings.get("goalWeightKg")).toEqual({ key: "goalWeightKg", value: 80 });
  });

  it("does not replace an update notice with late open success", async () => {
    let finishOpen!: () => void;
    vi.spyOn(db, "open").mockImplementationOnce(() => new Dexie.Promise<Dexie>((resolve) => {
      finishOpen = () => resolve(db);
    }));
    render(<ToastProvider><DatabaseGate><p>Journal ready</p></DatabaseGate></ToastProvider>);
    await act(async () => {
      notice.current = "updated_elsewhere";
      notice.listener?.("updated_elsewhere");
      finishOpen();
    });
    expect(screen.getByRole("heading", { name: "Fit was updated" })).toBeInTheDocument();
    expect(screen.queryByText("Journal ready")).toBeNull();
  });

  it("explains a blocked update while the database is opening", async () => {
    vi.spyOn(db, "open").mockImplementationOnce(() => new Dexie.Promise<Dexie>(() => {}));
    render(<ToastProvider><DatabaseGate><p>Journal ready</p></DatabaseGate></ToastProvider>);
    act(() => notice.listener?.("upgrade_blocked"));
    expect(screen.getByRole("heading", { name: "Waiting for other windows" })).toBeInTheDocument();
    expect(screen.getByText(/Close other Fit windows/)).toBeInTheDocument();
  });
});
