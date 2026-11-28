import type { Locator, Page } from "@playwright/test";

export class CheckoutInformationPage {
  readonly page: Page;
  readonly title: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly error: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("title");
    this.firstName = page.getByTestId("firstName");
    this.lastName = page.getByTestId("lastName");
    this.postalCode = page.getByTestId("postalCode");
    this.error = page.getByTestId("error");
    this.continueButton = page.getByTestId("continue");
    this.cancelButton = page.getByTestId("cancel");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  async goto() {
    await this.page.goto("/checkout-step-one.html");
  }

  async dismissError() {
    await this.page.getByRole("button", { name: "Dismiss error", exact: true }).click();
  }

  async fillUserInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
