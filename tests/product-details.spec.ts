import { test, expect } from "../fixtures/pages";
import { usersData } from "../test-data/users";

test.describe("Product details PageObject", () => {
  const product = "Sauce Labs Backpack";

  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(usersData.username, usersData.password);
    await expect(inventoryPage.title).toHaveText("Products");
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.goto();
    await cartPage.clear();
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });

  test("add a product from its details and preserve it when returning to Products", async ({
    inventoryPage, productDetailsPage, cartPage,
  }) => {
    await inventoryPage.openProduct(product);
    await expect(productDetailsPage.page).toHaveURL(/\/inventory-item\.html\?id=4$/);
    await expect(productDetailsPage.content).toBeVisible();
    await expect(productDetailsPage.name).toHaveText(product);
    await expect(productDetailsPage.description).not.toBeEmpty();
    await expect(productDetailsPage.price).toHaveText("$29.99");

    await productDetailsPage.addToCart();
    await expect(productDetailsPage.removeButton).toBeVisible();
    await expect(productDetailsPage.cartBadge).toHaveText("1");

    await productDetailsPage.backToProducts();
    await expect(inventoryPage.title).toHaveText("Products");
    await expect(inventoryPage.removeButton(product)).toBeVisible();
    await inventoryPage.goToCart();

    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemName(product)).toHaveText(product);
    await expect(cartPage.itemQuantity(product)).toHaveText("1");
    await expect(cartPage.itemPrice(product)).toHaveText("$29.99");
  });
});
