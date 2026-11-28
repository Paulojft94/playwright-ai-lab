// spec: specs/testing/dynamic-catalog-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, freezeClock } from "../support";
import { catalog } from "../../../test-data/catalog";
registerHooks();
test.beforeEach(async ({ page }) => { await freezeClock(page); });


test("DYN-03 — Slider controls select the requested product", async ({ inventoryPage, dynamicCatalogSliderPage: slider }) => {
  // 1. Capture the source image associations before navigating.
  const products = [];
  for (const name of ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Fleece Jacket"]) {
    products.push({ ...catalog.find(p => p.name === name)!, image: await inventoryPage.itemImage(name).getAttribute("src") });
  }
  await slider.goto();
  await expect(slider.page).toHaveURL(/\/dynamic-catalog-slider.html$/);
  await expect(slider.title).toHaveText("Dynamic Catalog - Slider");
  await expect(slider.controls).toHaveCount(6);
  // 2. A frozen interval isolates each manual choice from auto-advance.
  for (const product of products) {
    await slider.select(product.name);
    await expect(slider.card).toHaveCount(1);
    await expect(slider.name).toHaveText(product.name);
    await expect(slider.price).toHaveText(product.price);
    await expect(slider.image).toHaveAttribute("alt", product.name);
    await expect(slider.image).toHaveAttribute("src", product.image!);
    await expect(slider.currentControl).toHaveCount(1);
    await expect(slider.control(product.name)).toHaveAttribute("aria-current", "true");
  }
  await expect(slider.cartBadge).toHaveCount(0);
});
