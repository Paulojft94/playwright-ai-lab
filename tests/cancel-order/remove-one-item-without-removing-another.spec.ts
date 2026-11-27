// spec: specs/testing/cancel-order.md (CART-CANCEL-02)
import {
  test, expect, backpack, bikeLight, productRow, registerCartHooks,
  expectCart, expectEmptyCart, expectStage, openCart,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks([backpack, bikeLight]);

  test("remove-one-item-without-removing-another", async ({ page, cartItems }) => {
    const remaining = cartItems.filter(item => item.name === bikeLight.name);

    // 1. Click Remove specifically within the Backpack row.
    await productRow(page, backpack.name).getByRole("button", { name: "Remove", exact: true }).click();
    await expectCart(page, remaining);
    await expect(productRow(page, backpack.name)).toHaveCount(0);

    // 2. Click Continue Shopping, then reopen the cart.
    await page.getByRole("button", { name: "Continue Shopping", exact: true }).click();
    await expectStage(page, "/inventory.html", "Products");
    await openCart(page);
    await expectCart(page, remaining);
    await expect(productRow(page, backpack.name)).toHaveCount(0);

    // 3. Remove Bike Light.
    await productRow(page, bikeLight.name).getByRole("button", { name: "Remove", exact: true }).click();
    await expectEmptyCart(page);
  });
});
