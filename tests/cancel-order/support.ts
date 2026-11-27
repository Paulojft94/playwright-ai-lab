import type { Page } from "@playwright/test";
import { test as loginTest, expect } from "../../fixtures/login";
import { usersData } from "../../test-data/users";

export type CartItem = { name: string; price: string };
export const backpack: CartItem = { name: "Sauce Labs Backpack", price: "$29.99" };
export const bikeLight: CartItem = { name: "Sauce Labs Bike Light", price: "$9.99" };

// A new recorded item list is created for every test, including parallel runs.
export const test = loginTest.extend<{ cartItems: CartItem[] }>({
  cartItems: async ({}, use) => {
    await use([]);
  },
});
export { expect };

export function productRow(page: Page, name: string) {
  return page.getByTestId("inventory-item").filter({
    has: page.getByTestId("inventory-item-name").getByText(name, { exact: true }),
  });
}

export async function expectStage(page: Page, path: string, title: string) {
  await expect(page).toHaveURL(new URL(path, "https://www.saucedemo.com/").href);
  await expect(page.getByTestId("title")).toHaveText(title);
}

export async function expectNoCompletion(page: Page) {
  await expect(page).not.toHaveURL(/\/checkout-complete\.html$/);
  await expect(page.getByTestId("complete-header")).not.toBeVisible();
  await expect(page.getByText(
    "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    { exact: true },
  )).not.toBeVisible();
}

export async function expectEmptyBadge(page: Page) {
  await expect(page.getByTestId("shopping-cart-badge")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cart, empty", exact: true })).toBeVisible();
}

export async function expectEmptyCart(page: Page) {
  await expectStage(page, "/cart.html", "Your Cart");
  await expect(page.getByTestId("inventory-item")).toHaveCount(0);
  await expectEmptyBadge(page);
  await expectNoCompletion(page);
}

export async function expectSelection(page: Page, items: readonly CartItem[]) {
  await expect(page.getByTestId("inventory-item")).toHaveCount(items.length);
  await expect(page.getByTestId("shopping-cart-badge")).toHaveText(String(items.length));
  for (const item of items) {
    const row = productRow(page, item.name);
    await expect(row).toHaveCount(1);
    await expect(row.getByTestId("inventory-item-name")).toHaveText(item.name);
    await expect(row.getByTestId("item-quantity")).toHaveText("1");
    await expect(row.getByTestId("inventory-item-price")).toHaveText(item.price);
  }
}

export async function expectCart(page: Page, items: readonly CartItem[]) {
  await expectStage(page, "/cart.html", "Your Cart");
  await expectSelection(page, items);
  await expectNoCompletion(page);
}

export async function openCart(page: Page) {
  await page.getByTestId("shopping-cart-link").click();
  await expectStage(page, "/cart.html", "Your Cart");
}

export async function openCustomerInformation(page: Page, itemCount = 1) {
  await page.getByRole("button", { name: "Checkout", exact: true }).click();
  await expectStage(page, "/checkout-step-one.html", "Checkout: Your Information");
  await expect(page.getByTestId("shopping-cart-badge")).toHaveText(String(itemCount));
}

export async function fillCustomerInformation(page: Page) {
  await page.getByRole("textbox", { name: "First Name", exact: true }).fill("Ana");
  await page.getByRole("textbox", { name: "Last Name", exact: true }).fill("Silva");
  await page.getByRole("textbox", { name: "Zip/Postal Code", exact: true }).fill("1000-001");
}

export async function openOverview(page: Page, itemCount = 1) {
  await openCustomerInformation(page, itemCount);
  await fillCustomerInformation(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expectStage(page, "/checkout-step-two.html", "Checkout: Overview");
}

// Register within each spec's describe so every file gets both lifecycle hooks.
export function registerCartHooks(products: readonly CartItem[] = [backpack]) {
  test.beforeEach(async ({ page, loginPage, cartItems }) => {
    await page.goto("");
    await loginPage.login(usersData.username, usersData.password);
    await expectStage(page, "/inventory.html", "Products");
    await expectEmptyBadge(page);

    for (const product of products) {
      const row = productRow(page, product.name);
      await expect(row).toHaveCount(1);
      await expect(row.getByTestId("inventory-item-price")).toHaveText(product.price);
      cartItems.push({
        name: await row.getByTestId("inventory-item-name").innerText(),
        price: await row.getByTestId("inventory-item-price").innerText(),
      });
      await row.getByRole("button", { name: "Add to cart", exact: true }).click();
      await expect(row.getByRole("button", { name: "Remove", exact: true })).toBeVisible();
    }
    await expect(page.getByTestId("shopping-cart-badge")).toHaveText(String(products.length));
    await openCart(page);
    await expectCart(page, cartItems);
  });

  test.afterEach(async ({ page }) => {
    // Remove only this test's cart data through the UI; context teardown clears auth.
    if (page.isClosed()) return;
    await page.goto("/cart.html");
    await expectStage(page, "/cart.html", "Your Cart");
    const removeButtons = page.getByRole("button", { name: "Remove", exact: true });
    for (let remaining = await removeButtons.count(); remaining > 0; remaining--) {
      await removeButtons.first().click();
      await expect(removeButtons).toHaveCount(remaining - 1);
    }
    await expectEmptyCart(page);
  });
}
