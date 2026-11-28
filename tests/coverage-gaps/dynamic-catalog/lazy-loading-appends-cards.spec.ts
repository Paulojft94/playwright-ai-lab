// spec: specs/testing/dynamic-catalog-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks } from "../support";
registerHooks();

test("DYN-01 — Lazy loading appends coherent product cards", async ({ menu, dynamicCatalogLazyLoadPage: lazy }) => {
  // 1. Initial batches depend on viewport intersection; wait for real loaded cards.
  await menu.dynamicCatalog("Lazy Load");
  await expect(lazy.page).toHaveURL(/\/dynamic-catalog-lazy-load.html$/);
  await expect(lazy.title).toHaveText("Dynamic Catalog - Lazy Load");
  await expect.poll(async () => (await lazy.products()).filter(p => p.name).length).toBeGreaterThanOrEqual(6);
  const initial = await lazy.products();
  const initialCount = initial.length;
  expect(initialCount).toBeGreaterThanOrEqual(6);
  expect(initialCount % 6).toBe(0);
  // 2. Scrolling the sentinel appends another batch.
  await lazy.loadMore();
  await expect.poll(() => lazy.cards.count()).toBeGreaterThan(initialCount);
  const requestedCount = initialCount + 6;
  // 3. Cards resolve when they intersect the viewport, not on a timer.
  for (let index = 0; index < requestedCount; index++) await lazy.revealCard(index);
  await expect.poll(async () => (await lazy.products()).slice(0, requestedCount)
    .every(p => p.name.length > 0 && /^\$\d+\.\d{2}$/.test(p.price) && p.image === p.name)).toBe(true);
  const after = await lazy.products();
  expect(after.slice(0, initialCount).map(p => p.id)).toEqual(initial.map(p => p.id));
  for (const original of initial.filter(p => p.name)) expect(after.find(p => p.id === original.id)).toEqual(original);
  expect(new Set(after.map(p => p.id)).size).toBe(after.length);
  await expect(lazy.cartBadge).toHaveCount(0);
});
