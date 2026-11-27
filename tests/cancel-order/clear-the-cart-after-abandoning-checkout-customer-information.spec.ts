// spec: specs/testing/cancel-order.md (CART-CANCEL-08, customer-information)
import { test } from "../../fixtures/pages";
import { backpack } from "../../test-data/products";
import {
  registerCartHooks, openCustomerInformation, expectCart, expectEmptyCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("clear-the-cart-after-abandoning-checkout-customer-information", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
    // 1. Abandon checkout through the customer-information route.
    await openCustomerInformation(cartPage, checkoutInformationPage);
    await checkoutInformationPage.fillUserInformation("Ana", "", "");
    await checkoutInformationPage.cancel();
    await expectCart(cartPage, cartItems, checkoutCompletePage);

    // 2. Click Remove within the Backpack row.
    await cartPage.removeItem(backpack.name);
    await expectEmptyCart(cartPage, checkoutCompletePage);

    // 3. Reload the cart.
    await cartPage.reload();
    await expectEmptyCart(cartPage, checkoutCompletePage);
  });
});
