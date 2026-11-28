// spec: specs/testing/navigation-reset-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks } from "../support";
registerHooks();

for (const [name, path] of [["Lazy Load", "lazy-load"], ["Spinner", "spinner"], ["Slider", "slider"]] as const) {
  test(`NAV-01 — All Items returns from Dynamic Catalog: ${name}`, async ({ menu, inventoryPage }) => {
    // 1. Navigate to each independent Dynamic Catalog route.
    await menu.dynamicCatalog(name);
    await expect(inventoryPage.page).toHaveURL(new RegExp(`/dynamic-catalog-${path}.html$`));
    await expect(inventoryPage.title).toHaveText(`Dynamic Catalog - ${name}`);
    // 2. Return to the standard catalog without changing the cart.
    await menu.allItems();
    await expect(inventoryPage.page).toHaveURL(/\/inventory.html$/);
    await expect(inventoryPage.title).toHaveText("Products");
    await expect(inventoryPage.items).toHaveCount(6);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
}
