import type { Locator, Page } from "@playwright/test";

export class DynamicCatalogSliderPage {
  readonly title: Locator;
  readonly card: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly controls: Locator;
  readonly currentControl: Locator;
  readonly cartBadge: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId("title");
    this.card = page.getByTestId("dynamic-catalog-slider-item");
    this.name = page.getByTestId("dynamic-catalog-slider-item-name");
    this.price = page.getByTestId("dynamic-catalog-slider-item-price");
    this.image = page.getByTestId("dynamic-catalog-slider-item-img");
    this.controls = page.getByTestId("dynamic-catalog-slider-dots").getByRole("button");
    this.currentControl = this.controls.and(page.locator('[aria-current="true"]'));
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  control(name: string): Locator {
    return this.controls.and(
      this.page.getByRole("button", { name: `Show ${name}`, exact: true }),
    );
  }

  async goto() { await this.page.goto("/dynamic-catalog-slider.html"); }

  async productOrder(): Promise<string[]> {
    return this.controls.evaluateAll(buttons => buttons.map(button =>
      button.getAttribute("aria-label")!.replace(/^Show /, ""),
    ));
  }

  async select(name: string) { await this.control(name).click(); }
}
