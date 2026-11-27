// spec: specs/testing/cancel-order.md (CART-CANCEL-03)
import { test } from "../../fixtures/pages";
import { backpack } from "../../test-data/products";
import {
  registerCartHooks, expectEmptyCart, expectStage, openCart,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks();

  test("keep-a-removed-item-absent-after-reload", async ({ inventoryPage, cartPage, checkoutCompletePage }) => {
    // 1. Remove Backpack and confirm the cart is empty.
    await cartPage.removeItem(backpack.name);
    await expectEmptyCart(cartPage, checkoutCompletePage);

    // 2. Reload the cart in the same authenticated browser session.
    await cartPage.reload();
    await expectEmptyCart(cartPage, checkoutCompletePage);

    // 3. Click Continue Shopping and reopen the cart.
    await cartPage.continueShopping();
    await expectStage(inventoryPage, "/inventory.html", "Products");
    await openCart(inventoryPage, cartPage);
    await expectEmptyCart(cartPage, checkoutCompletePage);
  });
});
