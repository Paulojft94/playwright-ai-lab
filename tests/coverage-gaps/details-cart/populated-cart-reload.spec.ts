// spec: specs/testing/product-details-cart-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
registerHooks();


for (const products of [[backpack], [backpack, bikeLight]]) {
  test(`CART-01 — Populated cart survives reload: ${products.length} items`, async ({ inventoryPage, cartPage }) => {
    // 1. Create and verify the populated cart before reload.
    await addProducts(inventoryPage, products);
    await inventoryPage.goToCart();
    await expectSelection(cartPage, products);
    // 2. Reload retains authentication, identity, quantity and price.
    await cartPage.reload();
    await expect(cartPage.page).toHaveURL(/\/cart.html$/);
    await expect(cartPage.title).toHaveText("Your Cart");
    await expectSelection(cartPage, products);
    // 3. Shopping navigation introduces no duplicates.
    await cartPage.continueShopping();
    for (const product of products) await expect(inventoryPage.removeButton(product.name)).toBeVisible();
    await inventoryPage.goToCart();
    await expectSelection(cartPage, products);
  });
}
