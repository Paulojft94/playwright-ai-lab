// spec: specs/testing/cancel-order.md (CART-CANCEL-01)
import { test, expect } from "../../fixtures/pages";
import { backpack } from "../../test-data/products";
import {
  registerCartHooks, expectEmptyCart, expectEmptyBadge, expectStage, expectNoCompletion,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks();

  test("remove-the-only-item-from-cart", async ({ inventoryPage, cartPage, checkoutCompletePage }) => {
    // 1. Click Remove within the Backpack row.
    await cartPage.removeItem(backpack.name);
    await expectEmptyCart(cartPage, checkoutCompletePage);

    // 2. Inspect the page after removal.
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
    await expectNoCompletion(checkoutCompletePage);

    // 3. Click Continue Shopping.
    await cartPage.continueShopping();
    await expectStage(inventoryPage, "/inventory.html", "Products");
    await expectEmptyBadge(inventoryPage);
    await expect(inventoryPage.addButton(backpack.name)).toBeVisible();
  });
});
