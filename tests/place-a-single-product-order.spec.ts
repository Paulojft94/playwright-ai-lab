// spec: specs/testing/order.md (ORD-01)
// seed: tests/seed.spec.ts
import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/login";
import { usersData } from "../test-data/users";

const productName = "Sauce Labs Backpack";

async function addBackpack(page: Page) {
  const backpack = page.getByTestId("inventory-item").filter({
    has: page.getByTestId("inventory-item-name").getByText(productName, { exact: true }),
  });
  await expect(backpack).toHaveCount(1);
  await expect(backpack.getByTestId("inventory-item-name")).toHaveText(productName);
  await expect(backpack.getByTestId("inventory-item-price")).toHaveText("$29.99");
  const price = await backpack.getByTestId("inventory-item-price").innerText();
  await backpack.getByRole("button", { name: "Add to cart", exact: true }).click();
  return { backpack, price };
}

async function openCart(page: Page) {
  const { price } = await addBackpack(page);
  await page.getByTestId("shopping-cart-link").click();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(page.getByTestId("title")).toHaveText("Your Cart");
  return price;
}

async function openCustomerInformation(page: Page) {
  const price = await openCart(page);
  await page.getByTestId("checkout").click();
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  await expect(page.getByTestId("title")).toHaveText("Checkout: Your Information");
  return price;
}

async function openOverview(page: Page) {
  const price = await openCustomerInformation(page);
  await page.getByTestId("firstName").fill("Ana");
  await page.getByTestId("lastName").fill("Silva");
  await page.getByTestId("postalCode").fill("1000-001");
  await page.getByTestId("continue").click();
  await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  await expect(page.getByTestId("title")).toHaveText("Checkout: Overview");
  return price;
}

async function finishOrder(page: Page) {
  await openOverview(page);
  await expect(page.getByTestId("complete-header")).toHaveCount(0);
  await page.getByTestId("finish").click();
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
}

test.describe("ORD-01 — Place a single-product order", () => {
  // Each test gets its own fresh browser context and builds its required state.
  test.beforeEach(async ({ page, loginPage }) => {
    await page.goto("");
    await loginPage.login(usersData.username, usersData.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByTestId("title")).toHaveText("Products");
    await expect(page.getByTestId("shopping-cart-badge")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cart, empty", exact: true })).toBeVisible();
  });

  test("1. Record the Backpack name and price and add it to the cart", async ({ page }) => {
    // 1. On Products, record the Backpack name and price, then click its Add to cart button.
    const { backpack, price } = await addBackpack(page);
    expect(price).toBe("$29.99");
    await expect(backpack.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
    await expect(page.getByTestId("shopping-cart-badge")).toHaveText("1");
  });

  test("2. Show badge 1 and Remove, then open the cart", async ({ page }) => {
    // 2. Verify badge 1 and Backpack's Remove button; open the cart.
    const { backpack } = await addBackpack(page);
    await expect(page.getByTestId("shopping-cart-badge")).toHaveText("1");
    await expect(backpack.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
    await page.getByTestId("shopping-cart-link").click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByTestId("title")).toHaveText("Your Cart");
  });

  test("3. Show exactly one Backpack with the recorded price and quantity 1", async ({ page }) => {
    // 3. Verify Your Cart, one Backpack row, quantity 1, and the recorded price.
    const price = await openCart(page);
    const items = page.getByTestId("inventory-item");
    await expect(items).toHaveCount(1);
    await expect(items.getByTestId("inventory-item-name")).toHaveText(productName);
    await expect(items.getByTestId("item-quantity")).toHaveText("1");
    await expect(items.getByTestId("inventory-item-price")).toHaveText(price);
  });

  test("4. Open the customer-information page", async ({ page }) => {
    // 4. Click Checkout; verify Checkout: Your Information and its URL.
    await openCustomerInformation(page);
    await expect(page.getByRole("textbox", { name: "First Name", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Last Name", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Zip/Postal Code", exact: true })).toBeVisible();
    await expect(page.getByTestId("complete-header")).toHaveCount(0);
  });

  test("5. Accept Ana, Silva and 1000-001 and continue to overview", async ({ page }) => {
    // 5. Fill Ana / Silva / 1000-001 and click Continue.
    await openOverview(page);
    await expect(page.getByTestId("error")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Finish", exact: true })).toBeVisible();
    await expect(page.getByTestId("complete-header")).toHaveCount(0);
  });

  test("6. Show the correct product, payment, shipping and totals", async ({ page }) => {
    // 6. Verify Checkout: Overview, exactly the same Backpack row/quantity/price, payment/shipping information, and subtotal/tax/total.
    const price = await openOverview(page);
    const items = page.getByTestId("inventory-item");
    await expect(items).toHaveCount(1);
    await expect(items.getByTestId("inventory-item-name")).toHaveText(productName);
    await expect(items.getByTestId("item-quantity")).toHaveText("1");
    await expect(items.getByTestId("inventory-item-price")).toHaveText(price);
    await expect(page.getByText("SauceCard #31337", { exact: true })).toBeVisible();
    await expect(page.getByText("Free Pony Express Delivery!", { exact: true })).toBeVisible();
    await expect(page.getByTestId("subtotal-label")).toHaveText("Item total: $29.99");
    await expect(page.getByTestId("tax-label")).toHaveText("Tax: $2.40");
    await expect(page.getByTestId("total-label")).toHaveText("Total: $32.39");
    await expect(page.getByTestId("complete-header")).toHaveCount(0);
  });

  test("7. Finish the order and open the completion page", async ({ page }) => {
    // 7. Click Finish.
    await finishOrder(page);
    await expect(page.getByTestId("title")).toHaveText("Checkout: Complete!");
    await expect(page.getByTestId("complete-header")).toHaveText("Thank you for your order!");
  });

  test("8. Show confirmation, dispatch message, controls and an empty cart", async ({ page }) => {
    // 8. Verify Checkout: Complete!, Thank you for your order!, the dispatch message, Back Home, Generate PDF order, and an empty cart.
    await finishOrder(page);
    await expect(page.getByTestId("title")).toHaveText("Checkout: Complete!");
    await expect(page.getByTestId("complete-header")).toHaveText("Thank you for your order!");
    await expect(page.getByText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
      { exact: true },
    )).toBeVisible();
    await expect(page.getByRole("button", { name: "Back Home", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate PDF order", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, empty", exact: true })).toBeVisible();
    await expect(page.getByTestId("shopping-cart-badge")).toHaveCount(0);
    await expect(page.getByTestId("inventory-item")).toHaveCount(0);
  });
});
