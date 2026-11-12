import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly page: Page;
  private readonly loginButton: Locator;
  private readonly username: Locator;
  private readonly password: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByTestId("login-button");
    this.username = page.getByTestId("username");
    this.password = page.getByTestId("password");
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
