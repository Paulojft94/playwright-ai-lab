// spec: specs/testing/cancel-order.md (CART-CANCEL-06)
import { test, expect } from "../../fixtures/pages";
import {
  registerCartHooks, openCustomerInformation, expectStage, expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-after-a-customer-information-validation-error", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
    // 1. Click Checkout and Continue with all customer fields empty.
    await openCustomerInformation(cartPage, checkoutInformationPage);
    await checkoutInformationPage.clickContinue();
    await expectStage(checkoutInformationPage, "/checkout-step-one.html", "Checkout: Your Information");
    await expect(checkoutInformationPage.error).toHaveText("Error: First Name is required");

    // 2. Click Cancel while the error is visible.
    await checkoutInformationPage.cancel();
    await expectCart(cartPage, cartItems, checkoutCompletePage);
    await expect(checkoutInformationPage.error).not.toBeVisible();
  });
});
