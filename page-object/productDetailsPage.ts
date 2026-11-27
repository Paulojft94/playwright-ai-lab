import type { Locator, Page } from "@playwright/test";

export class ProductDetailsPage {
  readonly page: Page;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.name = page.getByTestId("inventory-item-name");
    this.description = page.getByTestId("inventory-item-desc");
    this.price = page.getByTestId("inventory-item-price");
    this.addButton = page.getByRole("button", { name: "Add to cart", exact: true });
    this.removeButton = page.getByRole("button", { name: "Remove", exact: true });
    this.backToProductsButton = page.getByTestId("back-to-products");
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  async goto(productId: number) {
    await this.page.goto(`/inventory-item.html?id=${productId}`);
  }

  async addToCart() {
    await this.addButton.click();
  }

  async removeFromCart() {
    await this.removeButton.click();
  }

  async backToProducts() {
    await this.backToProductsButton.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
