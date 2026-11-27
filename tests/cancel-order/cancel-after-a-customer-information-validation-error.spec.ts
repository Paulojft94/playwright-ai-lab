// spec: specs/testing/cancel-order.md (CART-CANCEL-06)
import {
  test, expect, registerCartHooks, openCustomerInformation, expectStage, expectCart,
} from "./support";

test.describe("Abandon checkout while preserving the cart", () => {
  registerCartHooks();

  test("cancel-after-a-customer-information-validation-error", async ({ page, cartItems }) => {
    // 1. Click Checkout and Continue with all customer fields empty.
    await openCustomerInformation(page);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expectStage(page, "/checkout-step-one.html", "Checkout: Your Information");
    await expect(page.getByTestId("error")).toHaveText("Error: First Name is required");

    // 2. Click Cancel while the error is visible.
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expectCart(page, cartItems);
    await expect(page.getByTestId("error")).not.toBeVisible();
  });
});
