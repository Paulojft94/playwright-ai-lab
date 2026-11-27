// spec: specs/testing/cancel-order.md (CART-CANCEL-08, order-overview)
import { test } from "../../fixtures/pages";
import { backpack } from "../../test-data/products";
import {
  registerCartHooks, openOverview, openCart, expectStage, expectCart, expectEmptyCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("clear-the-cart-after-abandoning-checkout-order-overview", async ({ inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage, cartItems }) => {
    // 1. Abandon checkout through the order-overview route.
    await openOverview(cartPage, checkoutInformationPage, checkoutOverviewPage);
    await checkoutOverviewPage.cancel();
    await expectStage(inventoryPage, "/inventory.html", "Products");
    await openCart(inventoryPage, cartPage);
    await expectCart(cartPage, cartItems, checkoutCompletePage);

    // 2. Click Remove within the Backpack row.
    await cartPage.removeItem(backpack.name);
    await expectEmptyCart(cartPage, checkoutCompletePage);

    // 3. Reload the cart.
    await cartPage.reload();
    await expectEmptyCart(cartPage, checkoutCompletePage);
  });
});
