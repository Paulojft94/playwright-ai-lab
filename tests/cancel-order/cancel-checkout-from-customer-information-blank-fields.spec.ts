// spec: specs/testing/cancel-order.md (CART-CANCEL-05, blank-fields)
import {
  test, expect, registerCartHooks, openCustomerInformation,
  expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-checkout-from-customer-information-blank-fields", async ({ page, cartItems }) => {
    // 1. Click Checkout.
    await openCustomerInformation(page);

    // 2. Prepare the blank-fields variant without clicking Continue.
    await expect(page.getByRole("textbox", { name: "First Name", exact: true })).toBeEmpty();
    await expect(page.getByRole("textbox", { name: "Last Name", exact: true })).toBeEmpty();
    await expect(page.getByRole("textbox", { name: "Zip/Postal Code", exact: true })).toBeEmpty();

    // 3. Click Cancel.
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectCart(page, cartItems);
    await expect(page.getByTestId("error")).not.toBeVisible();
  });
});
