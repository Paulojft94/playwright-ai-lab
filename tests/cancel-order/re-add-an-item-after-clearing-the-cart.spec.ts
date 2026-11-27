// spec: specs/testing/cancel-order.md (CART-CANCEL-04)
import { test, expect } from "../../fixtures/pages";
import { backpack } from "../../test-data/products";
import {
  registerCartHooks, expectEmptyCart, expectCart, expectStage, openCart,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks();

  test("re-add-an-item-after-clearing-the-cart", async ({ inventoryPage, cartPage, checkoutCompletePage, cartItems }) => {
    // 1. Remove Backpack and confirm an empty cart.
    await cartPage.removeItem(backpack.name);
    await expectEmptyCart(cartPage, checkoutCompletePage);

    // 2. Click Continue Shopping and add Backpack once.
    await cartPage.continueShopping();
    await expectStage(inventoryPage, "/inventory.html", "Products");
    await inventoryPage.addItemToCart(backpack.name);
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText("1");

    // 3. Open the cart.
    await openCart(inventoryPage, cartPage);
    await expectCart(cartPage, cartItems, checkoutCompletePage);
  });
});
