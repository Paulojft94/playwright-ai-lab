// spec: specs/testing/checkout-validation-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
registerHooks();


test("VALID-03 — Correct errors and preserve the order", async ({ inventoryPage, cartPage, checkoutInformationPage: info, checkoutOverviewPage: overview, checkoutCompletePage: complete }) => {
  // 1. Setup is a verified two-product cart.
  await addProducts(inventoryPage, [backpack, bikeLight]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack, bikeLight]);
  await cartPage.goToCheckout();
  // 2. Correct each error in order without losing previous values.
  await info.fillUserInformation("Ana", "", "");
  await info.clickContinue();
  await expect(info.error).toHaveText("Error: Last Name is required");
  await info.lastName.fill("Silva");
  await info.clickContinue();
  await expect(info.error).toHaveText("Error: Postal Code is required");
  await expect(info.firstName).toHaveValue("Ana");
  await expect(info.lastName).toHaveValue("Silva");
  await info.postalCode.fill("1000-001");
  await info.clickContinue();
  // 3. Overview and completion preserve the selected products and totals.
  await expect(overview.title).toHaveText("Checkout: Overview");
  await expectSelection(overview, [backpack, bikeLight]);
  await expect(overview.subtotal).toHaveText("Item total: $39.98");
  await expect(overview.tax).toHaveText("Tax: $3.20");
  await expect(overview.total).toHaveText("Total: $43.18");
  await expect(info.error).not.toBeVisible();
  await overview.completeCheckout();
  await expect(complete.page).toHaveURL(/\/checkout-complete.html$/);
  await expect(complete.header).toHaveText("Thank you for your order!");
  await expect(complete.cartBadge).toHaveCount(0);
});
