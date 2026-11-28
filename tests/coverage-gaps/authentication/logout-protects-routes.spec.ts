// spec: specs/testing/authentication-session-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack } from "../../../test-data/products";
registerHooks();


for (const target of ["back", "/cart.html", "/checkout-step-one.html"] as const) {
  test(`AUTH-02 — Logout revokes protected navigation: ${target}`, async ({
    loginPage, inventoryPage, cartPage, checkoutInformationPage, menu,
  }) => {
    // 1. Establish a selected product, then logout.
    await addProducts(inventoryPage, [backpack]);
    await menu.logout();
    await expect(loginPage.page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    // 2. History and direct protected routes cannot restore access.
    if (target === "back") await loginPage.page.goBack();
    else if (target === "/cart.html") await cartPage.goto();
    else await checkoutInformationPage.goto();
    await expect(loginPage.page).toHaveURL(/\/$/);
    await expect(loginPage.error).toContainText(`You can only access '${target === "back" ? "/inventory.html" : target}' when you are logged in.`);
    await expect(loginPage.loginButton).toBeVisible();
    // 3. A valid login restores navigation and the retained selection.
    await loginPage.login("standard_user", "secret_sauce");
    await expect(inventoryPage.title).toHaveText("Products");
    await inventoryPage.goToCart();
    await expectSelection(cartPage, [backpack]);
  });
}
