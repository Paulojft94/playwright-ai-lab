import type { Download, Locator, Page } from "@playwright/test";

export class CheckoutCompletePage {
  readonly page: Page;
  readonly title: Locator;
  readonly header: Locator;
  readonly dispatchMessage: Locator;
  readonly backHomeButton: Locator;
  readonly generatePdfButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("title");
    this.header = page.getByTestId("complete-header");
    this.dispatchMessage = page.getByTestId("complete-text");
    this.backHomeButton = page.getByTestId("back-to-products");
    this.generatePdfButton = page.getByTestId("generate-pdf-order");
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  async backHome() {
    await this.backHomeButton.click();
  }

  async downloadOrderPdf(): Promise<Download> {
    const download = this.page.waitForEvent("download");
    await this.generatePdfButton.click();
    return await download;
  }
}
