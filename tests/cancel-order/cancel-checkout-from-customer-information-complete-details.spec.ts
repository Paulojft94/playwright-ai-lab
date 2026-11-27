// spec: specs/testing/cancel-order.md (CART-CANCEL-05, complete-details)
import {
  test, expect, registerCartHooks, openCustomerInformation,
  fillCustomerInformation, expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-checkout-from-customer-information-complete-details", async ({ page, cartItems }) => {
    // 1. Click Checkout.
    await openCustomerInformation(page);

    // 2. Prepare the complete-details variant without clicking Continue.
    await fillCustomerInformation(page);

    // 3. Click Cancel.
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectCart(page, cartItems);
    await expect(page.getByTestId("error")).not.toBeVisible();
  });
});
