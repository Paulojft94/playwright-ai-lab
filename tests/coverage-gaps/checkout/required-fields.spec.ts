// spec: specs/testing/checkout-validation-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack } from "../../../test-data/products";
registerHooks();


for (const [field, message] of [[0, "First Name"], [1, "Last Name"], [2, "Postal Code"]] as const) {
  test(`VALID-01 — Required fields block checkout independently: ${message}`, async ({ inventoryPage, cartPage, checkoutInformationPage: info, checkoutOverviewPage: overview, checkoutCompletePage: complete }) => {
    // 1. Set up and verify a nonempty cart.
    await addProducts(inventoryPage, [backpack]);
    await inventoryPage.goToCart();
    await expectSelection(cartPage, [backpack]);
    await cartPage.goToCheckout();
    // 2. Omit only the selected field.
    const values = ["Ana", "Silva", "1000-001"];
    values[field] = "";
    await info.fillUserInformation(values[0], values[1], values[2]);
    await info.clickContinue();
    // 3. Validation blocks progress and preserves the other input and selection.
    await expect(info.error).toHaveText(`Error: ${message} is required`);
    await expect(info.page).toHaveURL(/\/checkout-step-one.html$/);
    await expect(info.title).toHaveText("Checkout: Your Information");
    await expect(info.firstName).toHaveValue(values[0]);
    await expect(info.lastName).toHaveValue(values[1]);
    await expect(info.postalCode).toHaveValue(values[2]);
    await expect(info.cartBadge).toHaveText("1");
    await expect(overview.finishButton).not.toBeVisible();
    await expect(complete.header).not.toBeVisible();
    await info.cancel();
    await expectSelection(cartPage, [backpack]);
  });
}
