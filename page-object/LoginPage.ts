import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByTestId("login-button");
    this.username = page.getByTestId("username");
    this.password = page.getByTestId("password");
    this.error = page.getByTestId("error");
  }

  async goto() {
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
