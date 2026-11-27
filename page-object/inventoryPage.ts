import type { Locator, Page } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly items: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("title");
    this.items = page.getByTestId("inventory-item");
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
    this.sortSelect = page.getByRole("combobox", { name: "Sort products" });
  }

  async goto() {
    await this.page.goto("/inventory.html");
  }

  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId("inventory-item-name").getByText(name, { exact: true }),
    });
  }

  itemName(name: string): Locator {
    return this.item(name).getByTestId("inventory-item-name");
  }

  itemPrice(name: string): Locator {
    return this.item(name).getByTestId("inventory-item-price");
  }

  addButton(name: string): Locator {
    return this.item(name).getByRole("button", { name: "Add to cart", exact: true });
  }

  removeButton(name: string): Locator {
    return this.item(name).getByRole("button", { name: "Remove", exact: true });
  }

  async addItemToCart(itemName: string) {
    await this.addButton(itemName).click();
  }

  async removeItem(itemName: string) {
    await this.removeButton(itemName).click();
  }

  async openProduct(itemName: string) {
    await this.itemName(itemName).click();
  }

  async sortBy(label: string) {
    await this.sortSelect.selectOption({ label });
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
