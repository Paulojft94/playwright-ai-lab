// spec: specs/testing/cancel-order.md (CART-CANCEL-07, single-item)
import {
  test, expect, backpack, productRow, registerCartHooks,
  openOverview, expectSelection, expectStage, expectCart, expectNoCompletion, openCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks([backpack]);

  test("cancel-checkout-from-order-overview-single-item", async ({ page, cartItems }) => {
    // 1. Click Checkout, enter valid customer details, and Continue.
    await openOverview(page, 1);
    await expectSelection(page, cartItems);
    await expect(page.getByTestId("subtotal-label")).toHaveText("Item total: $29.99");
    await expect(page.getByTestId("tax-label")).toHaveText("Tax: $2.40");
    await expect(page.getByTestId("total-label")).toHaveText("Total: $32.39");
    await expectNoCompletion(page);

    // 2. Click Cancel rather than Finish.
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectStage(page, "/inventory.html", "Products");
    await expect(page.getByTestId("shopping-cart-badge")).toHaveText("1");
    for (const item of cartItems) {
      await expect(productRow(page, item.name).getByRole("button", { name: "Remove", exact: true })).toBeVisible();
    }
    await expectNoCompletion(page);

    // 3. Reopen the cart.
    await openCart(page);
    await expectCart(page, cartItems);
  });
});
