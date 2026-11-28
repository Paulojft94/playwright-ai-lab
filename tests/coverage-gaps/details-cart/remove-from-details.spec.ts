// spec: specs/testing/product-details-cart-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
registerHooks();


test("DETAIL-01 — Remove from details without losing another item", async ({ inventoryPage, productDetailsPage, cartPage }) => {
  // 1. Open Bike Light with another selected item.
  await addProducts(inventoryPage, [backpack]);
  await inventoryPage.openProduct(bikeLight.name);
  await expect(productDetailsPage.page).toHaveURL(/\/inventory-item.html\?id=0$/);
  await expect(productDetailsPage.name).toHaveText(bikeLight.name);
  await expect(productDetailsPage.description).not.toBeEmpty();
  await expect(productDetailsPage.price).toHaveText(bikeLight.price);
  // 2. Add and remove only Bike Light.
  await productDetailsPage.addToCart();
  await expect(productDetailsPage.removeButton).toBeVisible();
  await expect(productDetailsPage.cartBadge).toHaveText("2");
  await productDetailsPage.removeFromCart();
  await expect(productDetailsPage.addButton).toBeVisible();
  await expect(productDetailsPage.cartBadge).toHaveText("1");
  // 3. Both cart and catalog reflect the remaining selection.
  await productDetailsPage.goToCart();
  await expectSelection(cartPage, [backpack]);
  await expect(cartPage.item(bikeLight.name)).toHaveCount(0);
  await cartPage.continueShopping();
  await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
  await expect(inventoryPage.addButton(bikeLight.name)).toBeVisible();
});
