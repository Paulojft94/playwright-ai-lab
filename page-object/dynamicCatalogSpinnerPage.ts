import type { Locator, Page } from "@playwright/test";

export class DynamicCatalogSpinnerPage {
  readonly title: Locator;
  readonly loading: Locator;
  readonly grid: Locator;
  readonly cards: Locator;
  readonly cartBadge: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId("title");
    this.loading = page.getByRole("status", { name: "Loading", exact: true });
    this.grid = page.getByTestId("dynamic-catalog-spinner-grid");
    this.cards = this.grid.locator(":scope > .dynamic_catalog_card");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  async goto() { await this.page.goto("/dynamic-catalog-spinner.html"); }

  async reload() { await this.page.reload(); }

  async products() {
    return this.cards.evaluateAll(cards => cards.map(card => ({
      name: card.querySelector('[data-test$="-name"]')!.textContent!,
      price: card.querySelector('[data-test$="-price"]')!.textContent!,
    })));
  }
}
