// spec: specs/testing/cancel-order.md (CART-CANCEL-05, partial-details)
import {
  test, expect, registerCartHooks, openCustomerInformation,
  expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-checkout-from-customer-information-partial-details", async ({ page, cartItems }) => {
    // 1. Click Checkout.
    await openCustomerInformation(page);

    // 2. Prepare the partial-details variant without clicking Continue.
    await page.getByRole("textbox", { name: "First Name", exact: true }).fill("Ana");

    // 3. Click Cancel.
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectCart(page, cartItems);
    await expect(page.getByTestId("error")).not.toBeVisible();
  });
});
