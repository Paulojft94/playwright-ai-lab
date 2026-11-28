// spec: specs/testing/catalog-sorting-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection, cents } from "../support";
import { backpack } from "../../../test-data/products";
import { catalog } from "../../../test-data/catalog";
registerHooks();


test("SORT-02 — Sorting preserves an existing selection", async ({ inventoryPage, cartPage }) => {
  // 1. Select Backpack before reordering.
  await addProducts(inventoryPage, [backpack]);
  // 2. Change each mode and verify selection after each transition.
  for (const label of ["Name (Z to A)", "Price (low to high)", "Price (high to low)", "Name (A to Z)"]) {
    await inventoryPage.sortBy(label);
    await expect(inventoryPage.sortSelect).toHaveValue(({"Name (A to Z)":"az","Name (Z to A)":"za","Price (low to high)":"lohi","Price (high to low)":"hilo"})[label]);
    const ordered = [...catalog].sort((a, b) => {
      const comparison = label.startsWith("Price") ? cents(a.price) - cents(b.price) : a.name.localeCompare(b.name);
      return label === "Name (Z to A)" || label === "Price (high to low)" ? -comparison : comparison;
    });
    if (label.startsWith("Price")) await expect(inventoryPage.productPrices).toHaveText(ordered.map(p => p.price));
    else await expect(inventoryPage.productNames).toHaveText(ordered.map(p => p.name));
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText("1");
    for (const product of catalog.filter(p => p.name !== backpack.name)) {
      await expect(inventoryPage.addButton(product.name)).toBeVisible();
    }
  }
  // 3. Cart identity/quantity/price are unchanged.
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack]);
});
