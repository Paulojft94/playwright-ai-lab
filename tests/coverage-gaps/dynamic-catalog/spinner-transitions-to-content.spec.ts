// spec: specs/testing/dynamic-catalog-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, freezeClock } from "../support";
import { catalog } from "../../../test-data/catalog";
registerHooks();
test.beforeEach(async ({ page }) => { await freezeClock(page); });


test("DYN-02 — Spinner transitions from loading to content", async ({ page, dynamicCatalogSpinnerPage: spinner }) => {
  const expected = [...catalog].sort((a,b) => a.name.localeCompare(b.name));
  // 1. A pre-installed paused clock keeps the Loading state observable.
  await spinner.goto();
  await expect(spinner.page).toHaveURL(/\/dynamic-catalog-spinner.html$/);
  await expect(spinner.title).toHaveText("Dynamic Catalog - Spinner");
  await expect(spinner.loading).toBeVisible();
  await expect(spinner.grid).not.toBeVisible();
  // 2. Source delay is 500–3000ms; advance beyond the upper bound.
  await page.clock.runFor(3001);
  await expect(spinner.loading).toHaveCount(0);
  await expect(spinner.cards).toHaveCount(6);
  expect((await spinner.products()).sort((a,b) => a.name.localeCompare(b.name))).toEqual(expected);
  await expect(spinner.cartBadge).toHaveCount(0);
  // 3. Reload creates the loading transition anew.
  await spinner.reload();
  await expect(spinner.loading).toBeVisible();
  await page.clock.runFor(3001);
  await expect(spinner.loading).toHaveCount(0);
  await expect(spinner.cards).toHaveCount(6);
  expect((await spinner.products()).sort((a,b) => a.name.localeCompare(b.name))).toEqual(expected);
  await expect(spinner.cartBadge).toHaveCount(0);
});
