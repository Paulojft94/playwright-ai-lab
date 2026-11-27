// spec: specs/testing/cancel-order.md (CART-CANCEL-05, blank-fields)
import { test, expect } from "../../fixtures/pages";
import {
  registerCartHooks, openCustomerInformation, expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-checkout-from-customer-information-blank-fields", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
    // 1. Click Checkout.
    await openCustomerInformation(cartPage, checkoutInformationPage);

    // 2. Prepare the blank-fields variant without clicking Continue.
    await expect(checkoutInformationPage.firstName).toBeEmpty();
    await expect(checkoutInformationPage.lastName).toBeEmpty();
    await expect(checkoutInformationPage.postalCode).toBeEmpty();

    // 3. Click Cancel.
    await checkoutInformationPage.cancel();
    await expectCart(cartPage, cartItems, checkoutCompletePage);
    await expect(checkoutInformationPage.error).not.toBeVisible();
  });
});
