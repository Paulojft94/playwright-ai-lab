// spec: specs/testing/catalog-sorting-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, cents } from "../support";
import { catalog } from "../../../test-data/catalog";
registerHooks();


for (const [label, value, field, descending] of [
  ["Name (A to Z)", "az", "name", false],
  ["Name (Z to A)", "za", "name", true],
  ["Price (low to high)", "lohi", "price", false],
  ["Price (high to low)", "hilo", "price", true],
] as const) {
  test(`SORT-01 — All sorting modes preserve the catalog: ${value}`, async ({ inventoryPage }) => {
    // 1. Record the starting identity/price pairs.
    const original = await inventoryPage.catalog();
    expect(original).toEqual(catalog);
    // 2. Sort and verify the selected mode and full ordering.
    await inventoryPage.sortBy(label);
    await expect(inventoryPage.sortSelect).toHaveValue(value);
    const sorted = [...original].sort((a, b) => {
      const comparison = field === "price" ? cents(a.price) - cents(b.price) : a.name.localeCompare(b.name);
      return descending ? -comparison : comparison;
    });
    if (field === "name") {
      await expect(inventoryPage.productNames).toHaveText(sorted.map(p => p.name));
    } else {
      await expect(inventoryPage.productPrices).toHaveText(sorted.map(p => p.price));
    }
    // 3. All products and their prices survive; ties need no identity order.
    expect((await inventoryPage.catalog()).sort((a,b) => a.name.localeCompare(b.name)))
      .toEqual([...original].sort((a,b) => a.name.localeCompare(b.name)));
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
}
