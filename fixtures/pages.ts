import { test as loginTest, expect } from "./login";
import { InventoryPage } from "../page-object/inventoryPage";
import { ProductDetailsPage } from "../page-object/productDetailsPage";
import { CartPage } from "../page-object/cartPage";
import { CheckoutInformationPage } from "../page-object/checkoutInformationPage";
import { CheckoutOverviewPage } from "../page-object/checkoutOverviewPage";
import { CheckoutCompletePage } from "../page-object/checkoutCompletePage";

type PageFixtures = {
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
};

export const test = loginTest.extend<PageFixtures>({
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
});

export { expect };
