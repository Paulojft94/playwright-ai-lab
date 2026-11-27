import { test, expect } from "../fixtures/login";
import { usersData } from "../test-data/users";
import { InventoryPage } from "../page-object/inventoryPage";
import { CartPage } from "../page-object/cartPage.spec";

test.describe("place an order", () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("");
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
  });

  test("place an order with valid credentials", async ({
    page,
    loginPage,
  }) => {
    await loginPage.login(usersData.username, usersData.password);

    await expect(page.getByText("Products")).toHaveText("Products");

    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();

    await expect(page.getByText("Your Cart")).toHaveText("Your Cart");

    await cartPage.goToCheckout();

    await expect(page.getByTestId("title")).toHaveText(
      "Checkout: Your Information",
    );

    await cartPage.fillUserInformation("John", "Doe", "12345");

    await cartPage.clickContinue();

    await expect(page.getByTestId("title")).toHaveText(
      "Checkout: Overview",
    );

    await cartPage.completeCheckout();

    await expect(page.getByTestId("complete-header")).toHaveText(
      "Thank you for your order!",
    );
  });
});
