import type { BrowserContext, Page } from "@playwright/test";
import { test as loginTest, expect } from "./login";
import { LoginPage } from "../page-object/LoginPage";
import { InventoryPage } from "../page-object/inventoryPage";

type BrowserContextFixtures = {
  isolatedContext: BrowserContext;
  isolatedPage: Page;
  isolatedLoginPage: LoginPage;
  isolatedInventoryPage: InventoryPage;
  sharedPage: Page;
  sharedInventoryPage: InventoryPage;
};

export const test = loginTest.extend<BrowserContextFixtures>({
  isolatedContext: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({ baseURL });
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  isolatedPage: async ({ isolatedContext }, use) => {
    await use(await isolatedContext.newPage());
  },
  isolatedLoginPage: async ({ isolatedPage }, use) => {
    await use(new LoginPage(isolatedPage));
  },
  isolatedInventoryPage: async ({ isolatedPage }, use) => {
    await use(new InventoryPage(isolatedPage));
  },
  sharedPage: async ({ context }, use) => {
    const page = await context.newPage();
    try {
      await use(page);
    } finally {
      await page.close();
    }
  },
  sharedInventoryPage: async ({ sharedPage }, use) => {
    await use(new InventoryPage(sharedPage));
  },
});

export { expect };
