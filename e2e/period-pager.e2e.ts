import { expect, test, type Page } from "@playwright/test";

const seedJournal = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("fit");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const transaction = request.result.transaction(["weightEntries", "exercises", "trainings", "sets"], "readwrite");
          const store = transaction.objectStore("weightEntries");
          for (let daysAgo = 0; daysAgo < 150; daysAgo += 3) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const stamp = date.toISOString();
            store.put({ id: `w${daysAgo}`, date: key, weightKg: 80 + Math.round(daysAgo / 3) / 10, note: null, createdAt: stamp, updatedAt: stamp });
          }
          const stamp = new Date().toISOString();
          transaction.objectStore("exercises").put({ id: "push-ups", name: "Push-ups", metric: "reps", metricLockedAt: stamp, progressWeightKg: null, progressView: "total", archivedAt: null, createdAt: stamp, updatedAt: stamp });
          for (const daysAgo of [0, 7]) {
            const day = new Date();
            day.setDate(day.getDate() - daysAgo);
            const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const trainingId = `training-${date}`;
            transaction.objectStore("trainings").put({ id: trainingId, date, name: null, note: null, createdAt: stamp, updatedAt: stamp });
            transaction.objectStore("sets").put({ id: `set-${date}`, exerciseId: "push-ups", trainingId, date, reps: 20, weightKg: null, seconds: null, note: null, createdAt: stamp, updatedAt: stamp });
          }
          transaction.oncomplete = () => { request.result.close(); resolve(); };
          transaction.onerror = () => reject(transaction.error);
        };
      }),
  );

const currentHeading = (page: Page) =>
  page.locator("[data-period-pager] > div > div:not([aria-hidden]) h1");

// Real touch input: the browser captures the pointer on the touched element
// and the pager then takes the capture over, which jsdom cannot reproduce.
test("a touch swipe that starts on the chart changes the month", async ({ page }) => {
  await page.goto("/#/weight");
  await expect(page.getByRole("button", { name: "Start the journal" })).toBeVisible();
  await seedJournal(page);
  await page.reload();

  const heading = currentHeading(page);
  const before = await heading.textContent();
  const chart = page.locator("[data-period-pager] > div > div:not([aria-hidden]) svg").first();
  const box = (await chart.boundingBox())!;
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * 0.3;

  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", x: number) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });

  await touch("touchStart", startX);
  for (let step = 1; step <= 12; step += 1) {
    await touch("touchMove", startX + step * 15);
  }
  const track = page.locator("[data-period-pager] > div");
  await expect(track).toHaveAttribute("style", /translate3d\(1\d\dpx/);
  await touch("touchEnd", startX + 180);

  await expect(heading).not.toHaveText(before ?? "");
  await expect(page).toHaveURL(/month=/);
});

for (const view of ["month", "weeks", "week", "training"] as const) {
  test(`${view} recovers from repeated future-boundary swipes`, async ({ page }) => {
    await page.goto("/#/weight");
    await expect(page.getByRole("button", { name: "Start the journal" })).toBeVisible();
    await seedJournal(page);
    const today = await page.evaluate(() => {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });
    const route = view === "training" ? "/exercises" : `/weight?view=${view}${view === "week" ? `&week=${today}` : ""}`;
    await page.goto(`/#${route}`);
    await page.reload();

    const heading = currentHeading(page);
    const latest = await heading.textContent();
    const track = page.locator("[data-period-pager] > div");
    const svg = page.locator("[data-period-pager] > div > div:not([aria-hidden]) svg").first();
    await expect(svg).toBeVisible();
    const cdp = await page.context().newCDPSession(page);
    const touch = async (type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) => {
      await cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
    };
    const swipe = async (direction: -1 | 1, pinned = false) => {
      const box = (await page.locator("[data-period-pager]").boundingBox())!;
      const chartBox = (await svg.boundingBox())!;
      const startX = direction < 0 ? box.x + box.width * 0.7 : box.x + box.width * 0.3;
      const y = chartBox.y + chartBox.height / 2;
      await touch("touchStart", startX, y);
      for (let step = 1; step <= 10; step += 1) {
        await touch("touchMove", startX + direction * step * 14, y);
        if (pinned) {
          await expect.poll(() => track.evaluate((element) => {
            const transform = getComputedStyle(element).transform;
            return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
          })).toBe(0);
        }
      }
      if (!pinned) await expect(track).toHaveAttribute("style", /translate3d\(/);
      await touch("touchEnd", startX + direction * 140, y);
    };

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await swipe(-1, true);
      await expect(heading).toHaveText(latest ?? "");
      await swipe(1);
      await expect(heading).not.toHaveText(latest ?? "");
      await swipe(-1);
      await expect(heading).toHaveText(latest ?? "");
    }
  });
}
