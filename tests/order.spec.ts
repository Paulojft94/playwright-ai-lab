import { test, expect } from "../fixtures/pages";
import { usersData } from "../test-data/users";

test.describe("place an order", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.goto();
    await cartPage.clear();
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });

  test("place an order with valid credentials", async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await loginPage.login(usersData.username, usersData.password);

    await expect(inventoryPage.title).toHaveText("Products");

    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();

    await expect(cartPage.title).toHaveText("Your Cart");

    await cartPage.goToCheckout();

    await expect(checkoutInformationPage.title).toHaveText(
      "Checkout: Your Information",
    );

    await checkoutInformationPage.fillUserInformation("John", "Doe", "12345");

    await checkoutInformationPage.clickContinue();

    await expect(checkoutOverviewPage.title).toHaveText(
      "Checkout: Overview",
    );

    await expect(checkoutOverviewPage.paymentInformation).toHaveText("SauceCard #31337");
    await expect(checkoutOverviewPage.shippingInformation).toHaveText("Free Pony Express Delivery!");
    await expect(checkoutOverviewPage.subtotal).toHaveText("Item total: $29.99");
    await expect(checkoutOverviewPage.tax).toHaveText("Tax: $2.40");
    await expect(checkoutOverviewPage.total).toHaveText("Total: $32.39");
    await checkoutOverviewPage.completeCheckout();

    await expect(checkoutCompletePage.title).toHaveText("Checkout: Complete!");
    await expect(checkoutCompletePage.header).toHaveText(
      "Thank you for your order!",
    );
    await expect(checkoutCompletePage.dispatchMessage).toHaveText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    );
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.generatePdfButton).toBeVisible();
    await expect(checkoutCompletePage.cartBadge).toHaveCount(0);
  });
});
