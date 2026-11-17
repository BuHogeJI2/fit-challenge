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

const currentPage = (page: Page) => page.locator("[data-period-current]");
const currentHeading = (page: Page) => currentPage(page).getByRole("heading", { level: 1 });
const translation = (page: Page) => page.locator("[data-period-pager] > div").evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41);

async function swipe(page: Page, target: ReturnType<Page["locator"]>, direction: -1 | 1, checkTracking = false) {
  await target.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2 - innerHeight / 2));
  const box = (await target.boundingBox())!;
  const viewport = (await page.locator("[data-period-pager]").boundingBox())!;
  const startX = viewport.x + viewport.width * (direction > 0 ? 0.22 : 0.78);
  const y = Math.max(5, Math.min(box.y + box.height / 2, page.viewportSize()!.height - 30));
  const before = await translation(page);
  const title = await currentHeading(page).textContent();
  const cdp = await page.context().newCDPSession(page);
  let time = Date.now() / 1000;
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", x: number) => cdp.send("Input.dispatchTouchEvent", { type, timestamp: time += 0.016, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  await touch("touchStart", startX);
  let moved = 0;
  let stillCurrent = title;
  for (let step = 1; step <= 12; step++) {
    await touch("touchMove", startX + direction * step * viewport.width * 0.65 / 12);
    await page.waitForTimeout(16);
    if (checkTracking && step === 6) {
      moved = (await translation(page) - before) * direction;
      stillCurrent = await currentHeading(page).textContent();
    }
  }
  await touch("touchEnd", startX + direction * viewport.width * 0.65);
  await cdp.detach();
  if (checkTracking) { expect(moved).toBeGreaterThan(25); expect(stillCurrent).toBe(title); }
}

async function openJournal(page: Page, route = "/weight") {
  await page.goto("/#/weight");
  await expect(page.getByRole("button", { name: "Start the journal" })).toBeVisible();
  await seedJournal(page);
  await page.goto(`/#${route}`);
  await page.reload();
  await expect(page.locator("[data-carousel-ready]")).toBeVisible();
}

test("chart drag follows the finger and only replaces the period after release", async ({ page }) => {
  await openJournal(page);
  const before = await currentHeading(page).textContent();
  await swipe(page, currentPage(page).locator("svg").first(), 1, true);
  await expect(currentHeading(page)).not.toHaveText(before!);
  await expect(page).toHaveURL(/month=/);
});

for (const view of ["month", "weeks", "week", "training"] as const) {
  test(`${view}: row swipes, future boundary and immediate reversal keep working`, async ({ page }) => {
    await openJournal(page, view === "training" ? "/exercises" : `/weight?view=${view}`);
    const latest = await currentHeading(page).textContent();
    const row = () => currentPage(page).getByRole(view === "weeks" || view === "training" ? "link" : "button", { name: view === "training" ? /Training/ : view === "weeks" ? /kg/ : /^Edit / }).last();
    for (let attempt = 0; attempt < 3; attempt++) {
      await swipe(page, row(), -1);
      await expect(currentHeading(page)).toHaveText(latest!);
      // Start the reverse gesture while the boundary spring is still running.
      await swipe(page, row(), 1, true);
      await expect(currentHeading(page)).not.toHaveText(latest!);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page).not.toHaveURL(/trainings\//);
      await swipe(page, currentPage(page).locator("p").first(), -1);
      await expect(currentHeading(page)).toHaveText(latest!);
    }
    // Embla must suppress a drag's click without suppressing the next real tap.
    await row().tap();
    if (view === "month" || view === "week") await expect(page.getByRole("dialog")).toBeVisible();
    else if (view === "training") await expect(page).toHaveURL(/trainings\//);
    else await expect(page).toHaveURL(/view=week&/);
  });
}

test("vertical touch scroll stays vertical and arrows still work afterwards", async ({ page }) => {
  await openJournal(page, "/weight?view=weeks");
  const before = await currentHeading(page).textContent();
  const row = currentPage(page).getByRole("link").first();
  await row.scrollIntoViewIfNeeded();
  const box = (await row.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = Math.min(box.y + box.height / 2, page.viewportSize()!.height - 50);
  const startScroll = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
  for (let step = 1; step <= 10; step++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 2, y: y - step * 18, id: 1 }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(startScroll + 50);
  await expect(currentHeading(page)).toHaveText(before!);
  await page.getByRole("button", { name: "Previous 12 weeks" }).tap();
  await expect(currentHeading(page)).not.toHaveText(before!);
  await page.getByRole("button", { name: "Next 12 weeks" }).tap();
  await expect(currentHeading(page)).toHaveText(before!);
});

test("reduced motion and an empty month between recorded months remain navigable", async ({ page }) => {
  await openJournal(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => new Promise<void>((resolve) => {
    const request = indexedDB.open("fit");
    request.onsuccess = () => {
      const tx = request.result.transaction("weightEntries", "readwrite");
      const date = new Date(); date.setMonth(date.getMonth() - 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const store = tx.objectStore("weightEntries");
      const cursor = store.openCursor();
      cursor.onsuccess = () => { const row = cursor.result; if (!row) return; if (row.value.date.startsWith(month)) row.delete(); row.continue(); };
      tx.oncomplete = () => { request.result.close(); resolve(); };
    };
  }));
  await page.reload();
  await expect(page.locator("[data-carousel-ready]")).toBeVisible();
  const latest = await currentHeading(page).textContent();
  await swipe(page, currentPage(page).locator("p").first(), 1);
  await expect(currentPage(page).getByText("Nothing logged in this month.")).toBeVisible();
  await swipe(page, currentPage(page).locator("p").first(), 1);
  await expect(currentPage(page).getByRole("list", { name: "Weigh-ins" })).toBeVisible();
  const older = await currentHeading(page).textContent();
  await page.getByRole("button", { name: "Next month" }).evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2 - innerHeight / 2));
  await page.getByRole("button", { name: "Next month" }).tap();
  await expect(currentHeading(page)).not.toHaveText(older!);
  await page.getByRole("button", { name: "Next month" }).evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2 - innerHeight / 2));
  await page.getByRole("button", { name: "Next month" }).tap();
  await expect(currentHeading(page)).toHaveText(latest!);
});

test("a boundary drag still permits an arrow tap, expansion and another swipe", async ({ page }) => {
  await openJournal(page);
  const latest = await currentHeading(page).textContent();
  await swipe(page, currentPage(page).locator("p").first(), -1);
  await page.getByRole("button", { name: "Previous month" }).tap();
  await expect(currentHeading(page)).not.toHaveText(latest!);
  const disclosure = page.getByRole("button", { name: /^Show all/ });
  await disclosure.tap();
  const lastRow = currentPage(page).getByRole("list", { name: "Weigh-ins" }).getByRole("button").last();
  await expect(lastRow).toBeVisible();
  const viewport = page.locator("[data-period-pager]");
  expect(await viewport.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  await swipe(page, lastRow, -1);
  await expect(currentHeading(page)).toHaveText(latest!);
});
