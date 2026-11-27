// spec: specs/testing/cancel-order.md (CART-CANCEL-02)
import { test, expect } from "../../fixtures/pages";
import { backpack, bikeLight } from "../../test-data/products";
import {
  registerCartHooks, expectCart, expectEmptyCart, expectStage, openCart,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks([backpack, bikeLight]);

  test("remove-one-item-without-removing-another", async ({ inventoryPage, cartPage, checkoutCompletePage, cartItems }) => {
    const remaining = cartItems.filter(item => item.name === bikeLight.name);

    // 1. Click Remove specifically within the Backpack row.
    await cartPage.removeItem(backpack.name);
    await expectCart(cartPage, remaining, checkoutCompletePage);
    await expect(cartPage.item(backpack.name)).toHaveCount(0);

    // 2. Click Continue Shopping, then reopen the cart.
    await cartPage.continueShopping();
    await expectStage(inventoryPage, "/inventory.html", "Products");
    await openCart(inventoryPage, cartPage);
    await expectCart(cartPage, remaining, checkoutCompletePage);
    await expect(cartPage.item(backpack.name)).toHaveCount(0);

    // 3. Remove Bike Light.
    await cartPage.removeItem(bikeLight.name);
    await expectEmptyCart(cartPage, checkoutCompletePage);
  });
});
