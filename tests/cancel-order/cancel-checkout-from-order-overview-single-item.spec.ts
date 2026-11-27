// spec: specs/testing/cancel-order.md (CART-CANCEL-07, single-item)
import { test, expect } from "../../fixtures/pages";
import { backpack } from "../../test-data/products";
import {
  registerCartHooks, openOverview, expectSelection, expectStage, expectCart, expectNoCompletion, openCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks([backpack]);

  test("cancel-checkout-from-order-overview-single-item", async ({ inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage, cartItems }) => {
    // 1. Click Checkout, enter valid customer details, and Continue.
    await openOverview(cartPage, checkoutInformationPage, checkoutOverviewPage, 1);
    await expectSelection(checkoutOverviewPage, cartItems);
    await expect(checkoutOverviewPage.subtotal).toHaveText("Item total: $29.99");
    await expect(checkoutOverviewPage.tax).toHaveText("Tax: $2.40");
    await expect(checkoutOverviewPage.total).toHaveText("Total: $32.39");
    await expectNoCompletion(checkoutCompletePage);

    // 2. Click Cancel rather than Finish.
    await checkoutOverviewPage.cancel();
    await expectStage(inventoryPage, "/inventory.html", "Products");
    await expect(inventoryPage.cartBadge).toHaveText("1");
    for (const item of cartItems) {
      await expect(inventoryPage.removeButton(item.name)).toBeVisible();
    }
    await expectNoCompletion(checkoutCompletePage);

    // 3. Reopen the cart.
    await openCart(inventoryPage, cartPage);
    await expectCart(cartPage, cartItems, checkoutCompletePage);
  });
});
