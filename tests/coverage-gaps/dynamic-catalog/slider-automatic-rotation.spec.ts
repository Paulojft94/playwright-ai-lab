// spec: specs/testing/dynamic-catalog-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, freezeClock } from "../support";
import { catalog } from "../../../test-data/catalog";
registerHooks();
test.beforeEach(async ({ page }) => { await freezeClock(page); });


test("DYN-04 — Slider auto-advance keeps card content consistent", async ({ page, inventoryPage, dynamicCatalogSliderPage: slider }) => {
  // 1. Capture product/image associations from the standard catalog.
  const products = [];
  for (const product of catalog) products.push({ ...product, image: await inventoryPage.itemImage(product.name).getAttribute("src") });
  await slider.goto();
  await expect(slider.controls).toHaveCount(6);
  // Buttons use aria-labels rather than visible text; capture the actual cycle order.
  const order = await slider.productOrder();
  expect(order.length).toBe(6);
  expect(new Set(order).size).toBe(6);
  const first = await slider.name.innerText();
  expect(order).toContain(first);
  const start = order.indexOf(first);
  // 2. The verified interval is 2000ms. One cycle must wrap without mixed content.
  for (let step = 0; step <= order.length; step++) {
    const name = order[(start + step) % order.length];
    const product = products.find(p => p.name === name)!;
    await expect(slider.card).toHaveCount(1);
    await expect(slider.name).toHaveText(name);
    await expect(slider.price).toHaveText(product.price);
    await expect(slider.image).toHaveAttribute("alt", name);
    await expect(slider.image).toHaveAttribute("src", product.image!);
    await expect(slider.currentControl).toHaveCount(1);
    await expect(slider.control(name)).toHaveAttribute("aria-current", "true");
    if (step < order.length) await page.clock.runFor(2000);
  }
  await expect(slider.name).toHaveText(first);
  await expect(slider.cartBadge).toHaveCount(0);
});
