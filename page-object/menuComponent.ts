import type { Page } from "@playwright/test";

export class MenuComponent {
  constructor(readonly page: Page) {}

  async open() {
    await this.page.getByRole("button", { name: "Open Menu", exact: true }).click();
  }

  async close() {
    await this.page.getByRole("button", { name: "Close Menu", exact: true }).click();
  }

  async logout() {
    await this.open();
    await this.page.getByRole("button", { name: "Logout", exact: true }).click();
  }

  async reset() {
    await this.open();
    await this.page.getByRole("button", { name: "Reset App State", exact: true }).click();
    await this.close();
  }

  async allItems() {
    await this.open();
    await this.page.getByRole("button", { name: "All Items", exact: true }).click();
  }

  async dynamicCatalog(name: "Lazy Load" | "Spinner" | "Slider") {
    await this.open();
    await this.page.getByRole("button", { name: "Dynamic Catalog", exact: true }).click();
    await this.page.getByRole("button", { name, exact: true }).click();
  }
}
