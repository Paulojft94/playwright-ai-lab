import type { Locator, Page } from "@playwright/test";

export class ProductDetailsPage {
  readonly page: Page;
  readonly content: Locator;
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
    // The URL can update before the catalogue has been replaced by the details view.
    this.content = page.locator(".inventory_details_container");
    this.name = this.content.getByTestId("inventory-item-name");
    this.description = this.content.getByTestId("inventory-item-desc");
    this.price = this.content.getByTestId("inventory-item-price");
    this.addButton = this.content.getByRole("button", { name: "Add to cart", exact: true });
    this.removeButton = this.content.getByRole("button", { name: "Remove", exact: true });
    this.backToProductsButton = page.getByTestId("back-to-products");
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  get image(): Locator { return this.content.getByRole("img"); }

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
