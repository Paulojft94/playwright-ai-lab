// spec: specs/testing/checkout-validation-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
registerHooks();


test("VALID-02 — Dismissal does not bypass validation", async ({ inventoryPage, cartPage, checkoutInformationPage: info }) => {
  // 1. Verify both setup items before checkout.
  await addProducts(inventoryPage, [backpack, bikeLight]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack, bikeLight]);
  await cartPage.goToCheckout();
  await info.fillUserInformation("Ana", "", "");
  await info.clickContinue();
  await expect(info.error).toHaveText("Error: Last Name is required");
  // 2. Dismiss the message but keep the entered values.
  await info.dismissError();
  await expect(info.error).not.toBeVisible();
  await expect(info.firstName).toHaveValue("Ana");
  await expect(info.lastName).toBeEmpty();
  await expect(info.postalCode).toBeEmpty();
  await expect(info.cartBadge).toHaveText("2");
  // 3. The invalid submission remains blocked.
  await info.clickContinue();
  await expect(info.error).toHaveText("Error: Last Name is required");
  await expect(info.page).toHaveURL(/\/checkout-step-one.html$/);
});
