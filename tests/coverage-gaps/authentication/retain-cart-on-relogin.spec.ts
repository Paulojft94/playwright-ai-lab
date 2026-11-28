// spec: specs/testing/authentication-session-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack } from "../../../test-data/products";
registerHooks();


test("AUTH-03 — Retain the same account's cart across relogin", async ({
  loginPage, inventoryPage, cartPage, menu,
}) => {
  // 1. Verify the selected cart before logout.
  await addProducts(inventoryPage, [backpack]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack]);
  await menu.logout();
  await expect(loginPage.loginButton).toBeVisible();
  // 2. Login in the same context: user-approved retention baseline.
  await loginPage.login("standard_user", "secret_sauce");
  await expect(inventoryPage.cartBadge).toHaveText("1");
  await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack]);
});
