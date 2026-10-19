import { beforeEach, describe, expect, it } from "vitest";
import { getSettings, setGoalWeight, setLastExportAt } from "../lib/db";
import { resetDatabase } from "./db-test-utils";

describe("settings repository", () => {
  beforeEach(resetDatabase);

  it("returns defaults when nothing is stored", async () => {
    expect(await getSettings()).toEqual({ goalWeightKg: null, lastExportAt: null });
  });

  it("stores and clears the goal weight", async () => {
    await setGoalWeight(80);
    await setLastExportAt("2026-10-19T08:00:00.000Z");

    expect(await getSettings()).toEqual({
      goalWeightKg: 80,
      lastExportAt: "2026-10-19T08:00:00.000Z",
    });

    await setGoalWeight(null);
    expect((await getSettings()).goalWeightKg).toBeNull();
  });

  it("rejects a non-positive goal weight", async () => {
    await expect(setGoalWeight(-1)).rejects.toMatchObject({ code: "invalid_input" });
  });
});
