// spec: specs/testing/navigation-reset-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
import { catalog } from "../../../test-data/catalog";
registerHooks();


test("RESET-02 — Reset remains coherent after navigation and reload", async ({ menu, inventoryPage, cartPage }) => {
  // 1. Verify two items before resetting on Products.
  await addProducts(inventoryPage, [backpack, bikeLight]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack, bikeLight]);
  await cartPage.continueShopping();
  await menu.reset();
  // 2. Remount the catalog after visiting another page.
  await menu.dynamicCatalog("Lazy Load");
  await expect(inventoryPage.title).toHaveText("Dynamic Catalog - Lazy Load");
  await menu.allItems();
  await expect(inventoryPage.cartBadge).toHaveCount(0);
  for (const product of catalog) await expect(inventoryPage.addButton(product.name)).toBeVisible();
  // 3. Reloaded cart is empty and accepts a fresh single selection.
  await inventoryPage.goToCart();
  await cartPage.reload();
  await expect(cartPage.title).toHaveText("Your Cart");
  await expect(cartPage.items).toHaveCount(0);
  await cartPage.continueShopping();
  await addProducts(inventoryPage, [bikeLight]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [bikeLight]);
});
