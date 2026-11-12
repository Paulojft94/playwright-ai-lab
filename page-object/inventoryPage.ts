import type { Locator, Page } from "@playwright/test";

export class InventoryPage {
  private readonly page: Page;
  private readonly cart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cart = page.getByTestId("shopping-cart-link");
  }

  get items() {
    return this.page.getByTestId("inventory-item");
  }

  async addItemToCart(itemName: string) {
    const item = this.items.filter({ hasText: itemName });
    const addToCartButton = item.getByRole("button", { name: "Add to cart" });
    await addToCartButton.click();
  }

  async goToCart() {
    await this.cart.click();
  }
}
