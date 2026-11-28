// spec: specs/testing/order-completion-receipts-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection, enterOverview, cents } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
registerHooks();


test("COMPLETE-01 — Complete a two-product order with correct totals", async ({ inventoryPage, cartPage, checkoutInformationPage: info, checkoutOverviewPage: overview, checkoutCompletePage: complete }) => {
  // 1. Create and verify the two-product cart.
  await addProducts(inventoryPage, [backpack, bikeLight]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack, bikeLight]);
  // 2. Checkout retains item identity and totals.
  await enterOverview(cartPage, info, overview);
  await expectSelection(overview, [backpack, bikeLight]);
  await expect(overview.subtotal).toHaveText("Item total: $39.98");
  await expect(overview.tax).toHaveText("Tax: $3.20");
  await expect(overview.total).toHaveText("Total: $43.18");
  await expect(overview.paymentInformation).toHaveText("SauceCard #31337");
  await expect(overview.shippingInformation).toHaveText("Free Pony Express Delivery!");
  const subtotal = cents(await overview.subtotal.innerText());
  expect(subtotal).toBe(cents(backpack.price) + cents(bikeLight.price));
  expect(cents(await overview.total.innerText())).toBe(subtotal + cents(await overview.tax.innerText()));
  // 3. Finish actually completes the order and clears the selection.
  await overview.completeCheckout();
  await expect(complete.page).toHaveURL(/\/checkout-complete.html$/);
  await expect(complete.title).toHaveText("Checkout: Complete!");
  await expect(complete.header).toHaveText("Thank you for your order!");
  await expect(complete.backHomeButton).toBeVisible();
  await expect(complete.generatePdfButton).toBeVisible();
  await expect(complete.cartBadge).toHaveCount(0);
});
