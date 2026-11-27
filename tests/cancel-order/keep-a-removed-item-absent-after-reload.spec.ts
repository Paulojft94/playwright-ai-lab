// spec: specs/testing/cancel-order.md (CART-CANCEL-03)
import {
  test, backpack, productRow, registerCartHooks,
  expectEmptyCart, expectStage, openCart,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks();

  test("keep-a-removed-item-absent-after-reload", async ({ page }) => {
    // 1. Remove Backpack and confirm the cart is empty.
    await productRow(page, backpack.name).getByRole("button", { name: "Remove", exact: true }).click();
    await expectEmptyCart(page);

    // 2. Reload the cart in the same authenticated browser session.
    await page.reload();
    await expectEmptyCart(page);

    // 3. Click Continue Shopping and reopen the cart.
    await page.getByRole("button", { name: "Continue Shopping", exact: true }).click();
    await expectStage(page, "/inventory.html", "Products");
    await openCart(page);
    await expectEmptyCart(page);
  });
});
