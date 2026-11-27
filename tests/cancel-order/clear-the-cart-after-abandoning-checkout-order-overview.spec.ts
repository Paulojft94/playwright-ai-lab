// spec: specs/testing/cancel-order.md (CART-CANCEL-08, order-overview)
import {
  test, backpack, productRow, registerCartHooks,
  openOverview, openCart,
  expectStage, expectCart, expectEmptyCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("clear-the-cart-after-abandoning-checkout-order-overview", async ({ page, cartItems }) => {
    // 1. Abandon checkout through the order-overview route.
    await openOverview(page);
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectStage(page, "/inventory.html", "Products");
    await openCart(page);
    await expectCart(page, cartItems);

    // 2. Click Remove within the Backpack row.
    await productRow(page, backpack.name).getByRole("button", { name: "Remove", exact: true }).click();
    await expectEmptyCart(page);

    // 3. Reload the cart.
    await page.reload();
    await expectEmptyCart(page);
  });
});
