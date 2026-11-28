// spec: specs/testing/catalog-sorting-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, expectSelection } from "../support";
registerHooks();

const onesie = { name: "Sauce Labs Onesie", price: "$7.99" };
const jacket = { name: "Sauce Labs Fleece Jacket", price: "$49.99" };

test("SORT-03 — Act on the correct item after sorting", async ({ inventoryPage, cartPage }) => {
  // 1. Add by identity in ascending and descending price order.
  await inventoryPage.sortBy("Price (low to high)");
  await inventoryPage.addItemToCart(onesie.name);
  await inventoryPage.sortBy("Price (high to low)");
  await inventoryPage.addItemToCart(jacket.name);
  await expect(inventoryPage.cartBadge).toHaveText("2");
  // 2. Verify both cart rows, then remove the intended product after reordering.
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [onesie, jacket]);
  await cartPage.continueShopping();
  await inventoryPage.sortBy("Price (high to low)");
  await inventoryPage.removeItem(onesie.name);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [jacket]);
  await expect(cartPage.item(onesie.name)).toHaveCount(0);
});
