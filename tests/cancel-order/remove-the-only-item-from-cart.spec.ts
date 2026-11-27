// spec: specs/testing/cancel-order.md (CART-CANCEL-01)
import {
  test, expect, backpack, productRow, registerCartHooks,
  expectEmptyCart, expectEmptyBadge, expectStage, expectNoCompletion,
} from "./support";

test.describe("Clear or edit the pending cart", () => {
  registerCartHooks();

  test("remove-the-only-item-from-cart", async ({ page }) => {
    // 1. Click Remove within the Backpack row.
    await productRow(page, backpack.name).getByRole("button", { name: "Remove", exact: true }).click();
    await expectEmptyCart(page);

    // 2. Inspect the page after removal.
    await expect(page.getByRole("button", { name: "Continue Shopping", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Checkout", exact: true })).toBeVisible();
    await expectNoCompletion(page);

    // 3. Click Continue Shopping.
    await page.getByRole("button", { name: "Continue Shopping", exact: true }).click();
    await expectStage(page, "/inventory.html", "Products");
    await expectEmptyBadge(page);
    await expect(productRow(page, backpack.name).getByRole("button", { name: "Add to cart", exact: true })).toBeVisible();
  });
});
