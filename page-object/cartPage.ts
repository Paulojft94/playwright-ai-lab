import { expect, type Locator, type Page } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly items: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("title");
    this.items = page.getByTestId("inventory-item");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.checkoutButton = page.getByTestId("checkout");
    this.continueShoppingButton = page.getByTestId("continue-shopping");
    this.removeButtons = page.getByRole("button", { name: "Remove", exact: true });
  }

  async goto() {
    await this.page.goto("/cart.html");
  }

  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId("inventory-item-name").getByText(name, { exact: true }),
    });
  }

  itemName(name: string): Locator {
    return this.item(name).getByTestId("inventory-item-name");
  }

  itemQuantity(name: string): Locator {
    return this.item(name).getByTestId("item-quantity");
  }

  itemPrice(name: string): Locator {
    return this.item(name).getByTestId("inventory-item-price");
  }

  async removeItem(name: string) {
    await this.item(name).getByRole("button", { name: "Remove", exact: true }).click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async goToCheckout() {
    await this.checkoutButton.click();
  }

  async clear() {
    await expect(this.title).toHaveText("Your Cart");
    for (let remaining = await this.removeButtons.count(); remaining > 0; remaining--) {
      await this.removeButtons.first().click();
      await expect(this.removeButtons).toHaveCount(remaining - 1);
    }
  }
}
