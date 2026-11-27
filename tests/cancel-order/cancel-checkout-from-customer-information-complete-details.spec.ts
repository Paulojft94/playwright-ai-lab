// spec: specs/testing/cancel-order.md (CART-CANCEL-05, complete-details)
import { test, expect } from "../../fixtures/pages";
import {
  registerCartHooks, openCustomerInformation, fillCustomerInformation, expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-checkout-from-customer-information-complete-details", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
    // 1. Click Checkout.
    await openCustomerInformation(cartPage, checkoutInformationPage);

    // 2. Prepare the complete-details variant without clicking Continue.
    await fillCustomerInformation(checkoutInformationPage);

    // 3. Click Cancel.
    await checkoutInformationPage.cancel();
    await expectCart(cartPage, cartItems, checkoutCompletePage);
    await expect(checkoutInformationPage.error).not.toBeVisible();
  });
});
