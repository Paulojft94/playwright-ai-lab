import type { Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly page: Page;
  private readonly checkoutButton: Locator;
  private readonly firstnameForm: Locator;
  private readonly lastnameForm: Locator;
  private readonly postalCodeForm: Locator;
  private readonly continueButton: Locator;
  private readonly completeCheckoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.getByTestId("checkout");
    this.firstnameForm = page.getByTestId("firstName");
    this.lastnameForm = page.getByTestId("lastName");
    this.postalCodeForm = page.getByTestId("postalCode");
    this.continueButton = page.getByTestId("continue");
    this.completeCheckoutButton = page.getByTestId("finish");
  }

  async goToCheckout() {
    await this.checkoutButton.click();
  }

  async fillUserInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ) {
    await this.firstnameForm.fill(firstName);
    await this.lastnameForm.fill(lastName);
    await this.postalCodeForm.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async completeCheckout() {
    await this.completeCheckoutButton.click();
  }
}
