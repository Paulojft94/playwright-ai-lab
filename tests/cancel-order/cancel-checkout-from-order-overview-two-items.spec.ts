// spec: specs/testing/cancel-order.md (CART-CANCEL-07, two-items)
import {
  test, expect, backpack, bikeLight, productRow, registerCartHooks,
  openOverview, expectSelection, expectStage, expectCart, expectNoCompletion, openCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks([backpack, bikeLight]);

  test("cancel-checkout-from-order-overview-two-items", async ({ page, cartItems }) => {
    // 1. Click Checkout, enter valid customer details, and Continue.
    await openOverview(page, 2);
    await expectSelection(page, cartItems);
    await expectNoCompletion(page);

    // 2. Click Cancel rather than Finish.
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectStage(page, "/inventory.html", "Products");
    await expect(page.getByTestId("shopping-cart-badge")).toHaveText("2");
    for (const item of cartItems) {
      await expect(productRow(page, item.name).getByRole("button", { name: "Remove", exact: true })).toBeVisible();
    }
    await expectNoCompletion(page);

    // 3. Reopen the cart.
    await openCart(page);
    await expectCart(page, cartItems);
  });
});
