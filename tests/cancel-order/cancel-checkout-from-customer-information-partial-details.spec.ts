// spec: specs/testing/cancel-order.md (CART-CANCEL-05, partial-details)
import { test, expect } from "../../fixtures/pages";
import {
  registerCartHooks, openCustomerInformation, expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-checkout-from-customer-information-partial-details", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
    // 1. Click Checkout.
    await openCustomerInformation(cartPage, checkoutInformationPage);

    // 2. Prepare the partial-details variant without clicking Continue.
    await checkoutInformationPage.fillUserInformation("Ana", "", "");

    // 3. Click Cancel.
    await checkoutInformationPage.cancel();
    await expectCart(cartPage, cartItems, checkoutCompletePage);
    await expect(checkoutInformationPage.error).not.toBeVisible();
  });
});
