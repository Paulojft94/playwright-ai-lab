// spec: specs/testing/product-details-cart-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks } from "../support";
import { backpack, bikeLight } from "../../../test-data/products";
registerHooks();


for (const [product, id] of [[bikeLight, 0], [backpack, 4]] as const) {
  for (const entry of ["image", "name"] as const) {
    test(`DETAIL-02 — Product identity agrees across entry points: ${product.name}, ${entry}`, async ({ inventoryPage, productDetailsPage }) => {
      // 1. Record the card data before taking either entry point.
      const description = await inventoryPage.itemDescription(product.name).innerText();
      const source = await inventoryPage.itemImage(product.name).getAttribute("src");
      if (entry === "image") await inventoryPage.openProductImage(product.name);
      else await inventoryPage.openProduct(product.name);
      // 2. Details belong to exactly this product.
      await expect(productDetailsPage.page).toHaveURL(new RegExp(`/inventory-item.html\\?id=${id}$`));
      await expect(productDetailsPage.content).toHaveCount(1);
      await expect(productDetailsPage.name).toHaveText(product.name);
      await expect(productDetailsPage.description).toHaveText(description);
      await expect(productDetailsPage.price).toHaveText(product.price);
      await expect(productDetailsPage.image).toHaveAttribute("src", source!);
      await expect(productDetailsPage.image).toHaveAttribute("alt", product.name);
      // 3. Return without selecting anything.
      await productDetailsPage.backToProducts();
      await expect(inventoryPage.title).toHaveText("Products");
      await expect(inventoryPage.items).toHaveCount(6);
      await expect(inventoryPage.cartBadge).toHaveCount(0);
    });
  }
}
