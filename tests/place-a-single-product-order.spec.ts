// spec: specs/testing/order.md (ORD-01)
// seed: tests/seed.spec.ts
import { test, expect, type PageFixtures } from "../fixtures/pages";
import { usersData } from "../test-data/users";

const productName = "Sauce Labs Backpack";

async function addBackpack(inventory: PageFixtures["inventoryPage"]) {
  await expect(inventory.item(productName)).toHaveCount(1);
  await expect(inventory.itemName(productName)).toHaveText(productName);
  await expect(inventory.itemPrice(productName)).toHaveText("$29.99");
  const price = await inventory.itemPrice(productName).innerText();
  await inventory.addItemToCart(productName);
  return price;
}

async function openCart(
  inventory: PageFixtures["inventoryPage"], cart: PageFixtures["cartPage"],
) {
  const price = await addBackpack(inventory);
  await inventory.goToCart();
  await expect(cart.page).toHaveURL(/\/cart\.html$/);
  await expect(cart.title).toHaveText("Your Cart");
  return price;
}

async function openCustomerInformation(
  inventory: PageFixtures["inventoryPage"], cart: PageFixtures["cartPage"],
  information: PageFixtures["checkoutInformationPage"],
) {
  const price = await openCart(inventory, cart);
  await cart.goToCheckout();
  await expect(information.page).toHaveURL(/\/checkout-step-one\.html$/);
  await expect(information.title).toHaveText("Checkout: Your Information");
  return price;
}

async function openOverview(
  inventory: PageFixtures["inventoryPage"], cart: PageFixtures["cartPage"],
  information: PageFixtures["checkoutInformationPage"],
  overview: PageFixtures["checkoutOverviewPage"],
) {
  const price = await openCustomerInformation(inventory, cart, information);
  await information.fillUserInformation("Ana", "Silva", "1000-001");
  await information.clickContinue();
  await expect(overview.page).toHaveURL(/\/checkout-step-two\.html$/);
  await expect(overview.title).toHaveText("Checkout: Overview");
  return price;
}

async function finishOrder(
  inventory: PageFixtures["inventoryPage"], cart: PageFixtures["cartPage"],
  information: PageFixtures["checkoutInformationPage"],
  overview: PageFixtures["checkoutOverviewPage"],
  complete: PageFixtures["checkoutCompletePage"],
) {
  await openOverview(inventory, cart, information, overview);
  await expect(complete.header).toHaveCount(0);
  await overview.completeCheckout();
  await expect(complete.page).toHaveURL(/\/checkout-complete\.html$/);
}

test.describe("ORD-01 — Place a single-product order", () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(usersData.username, usersData.password);
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText("Products");
    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await expect(inventoryPage.cartLink).toHaveAccessibleName("Cart, empty");
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.goto();
    await cartPage.clear();
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });

  test("1. Record the Backpack name and price and add it to the cart", async ({ inventoryPage }) => {
    // 1. On Products, record the Backpack name and price, then click its Add to cart button.
    const price = await addBackpack(inventoryPage);
    expect(price).toBe("$29.99");
    await expect(inventoryPage.removeButton(productName)).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText("1");
  });

  test("2. Show badge 1 and Remove, then open the cart", async ({ inventoryPage, cartPage }) => {
    // 2. Verify badge 1 and Backpack's Remove button; open the cart.
    await addBackpack(inventoryPage);
    await expect(inventoryPage.cartBadge).toHaveText("1");
    await expect(inventoryPage.removeButton(productName)).toBeVisible();
    await inventoryPage.goToCart();
    await expect(cartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.title).toHaveText("Your Cart");
  });

  test("3. Show exactly one Backpack with the recorded price and quantity 1", async ({
    inventoryPage, cartPage,
  }) => {
    // 3. Verify Your Cart, one Backpack row, quantity 1, and the recorded price.
    const price = await openCart(inventoryPage, cartPage);
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemName(productName)).toHaveText(productName);
    await expect(cartPage.itemQuantity(productName)).toHaveText("1");
    await expect(cartPage.itemPrice(productName)).toHaveText(price);
  });

  test("4. Open the customer-information page", async ({
    inventoryPage, cartPage, checkoutInformationPage, checkoutCompletePage,
  }) => {
    // 4. Click Checkout; verify Checkout: Your Information and its URL.
    await openCustomerInformation(inventoryPage, cartPage, checkoutInformationPage);
    await expect(checkoutInformationPage.firstName).toBeVisible();
    await expect(checkoutInformationPage.lastName).toBeVisible();
    await expect(checkoutInformationPage.postalCode).toBeVisible();
    await expect(checkoutCompletePage.header).toHaveCount(0);
  });

  test("5. Accept Ana, Silva and 1000-001 and continue to overview", async ({
    inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    // 5. Fill Ana / Silva / 1000-001 and click Continue.
    await openOverview(inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage);
    await expect(checkoutInformationPage.error).toHaveCount(0);
    await expect(checkoutOverviewPage.finishButton).toBeVisible();
    await expect(checkoutCompletePage.header).toHaveCount(0);
  });

  test("6. Show the correct product, payment, shipping and totals", async ({
    inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    // 6. Verify Checkout: Overview, exactly the same Backpack row/quantity/price, payment/shipping information, and subtotal/tax/total.
    const price = await openOverview(inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage);
    await expect(checkoutOverviewPage.items).toHaveCount(1);
    await expect(checkoutOverviewPage.itemName(productName)).toHaveText(productName);
    await expect(checkoutOverviewPage.itemQuantity(productName)).toHaveText("1");
    await expect(checkoutOverviewPage.itemPrice(productName)).toHaveText(price);
    await expect(checkoutOverviewPage.paymentInformation).toHaveText("SauceCard #31337");
    await expect(checkoutOverviewPage.shippingInformation).toHaveText("Free Pony Express Delivery!");
    await expect(checkoutOverviewPage.subtotal).toHaveText("Item total: $29.99");
    await expect(checkoutOverviewPage.tax).toHaveText("Tax: $2.40");
    await expect(checkoutOverviewPage.total).toHaveText("Total: $32.39");
    await expect(checkoutCompletePage.header).toHaveCount(0);
  });

  test("7. Finish the order and open the completion page", async ({
    inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    // 7. Click Finish.
    await finishOrder(inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage);
    await expect(checkoutCompletePage.title).toHaveText("Checkout: Complete!");
    await expect(checkoutCompletePage.header).toHaveText("Thank you for your order!");
  });

  test("8. Show confirmation, dispatch message, controls and an empty cart", async ({
    inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    // 8. Verify Checkout: Complete!, Thank you for your order!, the dispatch message, Back Home, Generate PDF order, and an empty cart.
    await finishOrder(inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage);
    await expect(checkoutCompletePage.title).toHaveText("Checkout: Complete!");
    await expect(checkoutCompletePage.header).toHaveText("Thank you for your order!");
    await expect(checkoutCompletePage.dispatchMessage).toHaveText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    );
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.generatePdfButton).toBeVisible();
    await expect(checkoutCompletePage.cartLink).toHaveAccessibleName("Cart, empty");
    await expect(checkoutCompletePage.cartBadge).toHaveCount(0);
  });
});
