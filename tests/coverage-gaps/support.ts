import type { Page } from "@playwright/test";
import { test, expect, type PageFixtures } from "../../fixtures/pages";
import { usersData } from "../../test-data/users";
import type { CartItem } from "../../test-data/products";
export { expectStage, expectSelection, expectEmptyBadge } from "../cancel-order/support";

export function registerHooks(loggedIn = true) {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    if (loggedIn) {
      await loginPage.login(usersData.username, usersData.password);
      await expect(inventoryPage.title).toHaveText("Products");
      await expect(inventoryPage.items).toHaveCount(6);
      await expect(inventoryPage.cartBadge).toHaveCount(0);
    } else {
      await expect(loginPage.loginButton).toBeVisible();
    }
  });
  test.afterEach(async ({ loginPage, cartPage }) => {
    // Resume deterministic timers before navigating during cleanup, even on failure.
    await cartPage.page.clock.resume();
    await cartPage.goto();
    if (new URL(cartPage.page.url()).pathname === "/") {
      await loginPage.login(usersData.username, usersData.password);
      await cartPage.goto();
    }
    await cartPage.clear();
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });
}

export async function freezeClock(page: Page) {
  const now = Date.now();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now + 1000);
}

export async function addProducts(inventory: PageFixtures["inventoryPage"], products: readonly CartItem[]) {
  for (const product of products) {
    await expect(inventory.itemPrice(product.name)).toHaveText(product.price);
    await inventory.addItemToCart(product.name);
    await expect(inventory.removeButton(product.name)).toBeVisible();
  }
  await expect(inventory.cartBadge).toHaveText(String(products.length));
}

export async function enterOverview(
  cart: PageFixtures["cartPage"], info: PageFixtures["checkoutInformationPage"],
  overview: PageFixtures["checkoutOverviewPage"], customer = ["Ana", "Silva", "1000-001"],
) {
  await cart.goToCheckout();
  await expect(info.title).toHaveText("Checkout: Your Information");
  await info.fillUserInformation(customer[0], customer[1], customer[2]);
  await info.clickContinue();
  await expect(overview.title).toHaveText("Checkout: Overview");
}

export function cents(text: string) {
  const match = text.match(/(\d+)\.(\d{2})/);
  if (!match) throw new Error(`No currency amount in ${text}`);
  return Number(match[1]) * 100 + Number(match[2]);
}
