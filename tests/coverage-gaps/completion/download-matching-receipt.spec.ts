// spec: specs/testing/order-completion-receipts-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection, enterOverview } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
import { receipt } from "../pdf";
registerHooks();


test("PDF-01 — Download a receipt matching the completed order", async ({ inventoryPage, cartPage, checkoutInformationPage: info, checkoutOverviewPage: overview, checkoutCompletePage: complete }, testInfo) => {
  // 1. Independently complete the selected order with recorded details.
  await addProducts(inventoryPage, [backpack, bikeLight]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack, bikeLight]);
  await enterOverview(cartPage, info, overview);
  await expectSelection(overview, [backpack, bikeLight]);
  await expect(overview.subtotal).toHaveText("Item total: $39.98");
  await expect(overview.tax).toHaveText("Tax: $3.20");
  await expect(overview.total).toHaveText("Total: $43.18");
  await overview.completeCheckout();
  await expect(complete.header).toHaveText("Thank you for your order!");
  // 2. Parse the downloaded file and compare customer/items/totals.
  const text = await receipt(await complete.downloadOrderPdf(), testInfo);
  expect(text).toContain("Order Receipt");
  expect(text).toContain("Ana Silva");
  expect(text).toContain("1000-001");
  expect(text).toMatch(/Sauce Labs Backpack\s*\$\s*29\.99/);
  expect(text).toMatch(/Sauce Labs Bike Light\s*\$\s*9\.99/);
  expect(text).toMatch(/Item total\s*\$\s*39\.98/);
  expect(text).toMatch(/Tax\s*\$\s*3\.20/);
  expect(text).toMatch(/Total\s*\$\s*43\.18/);
  // 3. Download does not mutate completion or cart.
  await expect(complete.page).toHaveURL(/\/checkout-complete.html$/);
  await expect(complete.cartBadge).toHaveCount(0);
});
