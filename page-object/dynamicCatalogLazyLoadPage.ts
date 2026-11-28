import type { Locator, Page } from "@playwright/test";

export class DynamicCatalogLazyLoadPage {
  readonly title: Locator;
  readonly container: Locator;
  readonly cards: Locator;
  readonly sentinel: Locator;
  readonly cartBadge: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId("title");
    this.container = page.getByTestId("dynamic-catalog-lazy-load-container");
    this.cards = this.container.locator(":scope > .dynamic_catalog_card");
    this.sentinel = page.getByTestId("dynamic-catalog-lazy-load-sentinel");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  async goto() { await this.page.goto("/dynamic-catalog-lazy-load.html"); }

  async revealCard(index: number) { await this.cards.nth(index).scrollIntoViewIfNeeded(); }

  async loadMore() { await this.sentinel.scrollIntoViewIfNeeded(); }

  async products() {
    return this.cards.evaluateAll(cards => cards.map(card => ({
      id: card.getAttribute("data-test"),
      name: card.querySelector('[data-test$="-name"]')?.textContent ?? "",
      price: card.querySelector('[data-test$="-price"]')?.textContent ?? "",
      image: card.querySelector("img")?.getAttribute("alt") ?? "",
    })));
  }
}
