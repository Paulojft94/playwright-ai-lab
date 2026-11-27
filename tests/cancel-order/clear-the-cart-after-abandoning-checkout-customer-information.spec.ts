// spec: specs/testing/cancel-order.md (CART-CANCEL-08, customer-information)
import {
  test, backpack, productRow, registerCartHooks,
  openCustomerInformation, expectCart, expectEmptyCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("clear-the-cart-after-abandoning-checkout-customer-information", async ({ page, cartItems }) => {
    // 1. Abandon checkout through the customer-information route.
    await openCustomerInformation(page);
    await page.getByRole("textbox", { name: "First Name", exact: true }).fill("Ana");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectCart(page, cartItems);

    // 2. Click Remove within the Backpack row.
    await productRow(page, backpack.name).getByRole("button", { name: "Remove", exact: true }).click();
    await expectEmptyCart(page);

    // 3. Reload the cart.
    await page.reload();
    await expectEmptyCart(page);
  });
});
