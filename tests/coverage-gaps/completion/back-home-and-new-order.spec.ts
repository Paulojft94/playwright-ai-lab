// spec: specs/testing/order-completion-receipts-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection, enterOverview } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
import { receipt } from "../pdf";
registerHooks();


test("COMPLETE-02 — Back Home starts a new independent purchase", async ({ inventoryPage, cartPage, checkoutInformationPage: info, checkoutOverviewPage: overview, checkoutCompletePage: complete }, testInfo) => {
  // 1. Complete the first order, then use Back Home.
  await addProducts(inventoryPage, [backpack]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack]);
  await enterOverview(cartPage, info, overview);
  await overview.completeCheckout();
  await expect(complete.header).toHaveText("Thank you for your order!");
  // Generate the first PDF too, so the second download detects stale receipt reuse.
  const first = await receipt(await complete.downloadOrderPdf(), testInfo);
  expect(first).toContain("Ana Silva");
  expect(first).toContain(backpack.name);
  await complete.backHome();
  await expect(inventoryPage.title).toHaveText("Products");
  await expect(inventoryPage.cartBadge).toHaveCount(0);
  await expect(inventoryPage.addButton(backpack.name)).toBeVisible();
  await inventoryPage.goToCart();
  await expect(cartPage.items).toHaveCount(0);
  // 2. Purchase only Bike Light for a different customer.
  await cartPage.continueShopping();
  await addProducts(inventoryPage, [bikeLight]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [bikeLight]);
  await enterOverview(cartPage, info, overview, ["Ben", "Costa", "2000-002"]);
  await expectSelection(overview, [bikeLight]);
  await expect(overview.subtotal).toHaveText("Item total: $9.99");
  await expect(overview.tax).toHaveText("Tax: $0.80");
  await expect(overview.total).toHaveText("Total: $10.79");
  await overview.completeCheckout();
  await expect(complete.header).toHaveText("Thank you for your order!");
  await expect(complete.cartBadge).toHaveCount(0);
  // 3. The second receipt has only the second customer's order data.
  const second = await receipt(await complete.downloadOrderPdf(), testInfo);
  expect(second).toContain("Ben Costa");
  expect(second).toContain("2000-002");
  expect(second).toMatch(/Sauce Labs Bike Light\s*\$\s*9\.99/);
  expect(second).toMatch(/Item total\s*\$\s*9\.99/);
  expect(second).toMatch(/Tax\s*\$\s*0\.80/);
  expect(second).toMatch(/Total\s*\$\s*10\.79/);
  expect(second).not.toContain("Ana");
  expect(second).not.toContain("Silva");
  expect(second).not.toContain("1000-001");
  expect(second).not.toContain(backpack.name);
});
