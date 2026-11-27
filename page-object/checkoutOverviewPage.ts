import type { Locator, Page } from "@playwright/test";

export class CheckoutOverviewPage {
  readonly page: Page;
  readonly title: Locator;
  readonly items: Locator;
  readonly cartBadge: Locator;
  readonly paymentInformation: Locator;
  readonly shippingInformation: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("title");
    this.items = page.getByTestId("inventory-item");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
    this.paymentInformation = page.getByTestId("payment-info-value");
    this.shippingInformation = page.getByTestId("shipping-info-value");
    this.subtotal = page.getByTestId("subtotal-label");
    this.tax = page.getByTestId("tax-label");
    this.total = page.getByTestId("total-label");
    this.cancelButton = page.getByTestId("cancel");
    this.finishButton = page.getByTestId("finish");
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

  async cancel() {
    await this.cancelButton.click();
  }

  async completeCheckout() {
    await this.finishButton.click();
  }
}
