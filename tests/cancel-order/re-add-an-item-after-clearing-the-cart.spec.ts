// spec: specs/testing/cancel-order.md (CART-CANCEL-04)
import {
  test, expect, backpack, productRow, registerCartHooks,
  expectEmptyCart, expectCart, expectStage, openCart,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks();

  test("re-add-an-item-after-clearing-the-cart", async ({ page, cartItems }) => {
    // 1. Remove Backpack and confirm an empty cart.
    await productRow(page, backpack.name).getByRole("button", { name: "Remove", exact: true }).click();
    await expectEmptyCart(page);

    // 2. Click Continue Shopping and add Backpack once.
    await page.getByRole("button", { name: "Continue Shopping", exact: true }).click();
    await expectStage(page, "/inventory.html", "Products");
    const row = productRow(page, backpack.name);
    await row.getByRole("button", { name: "Add to cart", exact: true }).click();
    await expect(row.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
    await expect(page.getByTestId("shopping-cart-badge")).toHaveText("1");

    // 3. Open the cart.
    await openCart(page);
    await expectCart(page, cartItems);
  });
});
