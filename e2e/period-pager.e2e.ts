import { expect, test, type Page } from "@playwright/test";

const seedWeights = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("fit");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const transaction = request.result.transaction("weightEntries", "readwrite");
          const store = transaction.objectStore("weightEntries");
          for (let daysAgo = 0; daysAgo < 70; daysAgo += 3) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const stamp = date.toISOString();
            store.put({ id: `w${daysAgo}`, date: key, weightKg: 80 + daysAgo / 100, note: null, createdAt: stamp, updatedAt: stamp });
          }
          transaction.oncomplete = () => resolve();
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
  await seedWeights(page);
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
  await touch("touchEnd", startX + 180);

  await expect(heading).not.toHaveText(before ?? "");
  await expect(page).toHaveURL(/month=/);
});
