import { DynamicCatalogSliderPage } from "../page-object/dynamicCatalogSliderPage";
import { DynamicCatalogSpinnerPage } from "../page-object/dynamicCatalogSpinnerPage";
import { DynamicCatalogLazyLoadPage } from "../page-object/dynamicCatalogLazyLoadPage";
import { MenuComponent } from "../page-object/menuComponent";
import { test as contextTest, expect } from "./browserContexts";
import type { CartItem } from "../test-data/products";
import { InventoryPage } from "../page-object/inventoryPage";
import { ProductDetailsPage } from "../page-object/productDetailsPage";
import { CartPage } from "../page-object/cartPage";
import { CheckoutInformationPage } from "../page-object/checkoutInformationPage";
import { CheckoutOverviewPage } from "../page-object/checkoutOverviewPage";
import { CheckoutCompletePage } from "../page-object/checkoutCompletePage";

export type PageFixtures = {
  dynamicCatalogSliderPage: DynamicCatalogSliderPage;
  dynamicCatalogSpinnerPage: DynamicCatalogSpinnerPage;
  dynamicCatalogLazyLoadPage: DynamicCatalogLazyLoadPage;
  menu: MenuComponent;
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  cartItems: CartItem[];
};

export const test = contextTest.extend<PageFixtures>({
  menu: async ({ page }, use) => {
    await use(new MenuComponent(page));
  },
  dynamicCatalogLazyLoadPage: async ({ page }, use) => {
    await use(new DynamicCatalogLazyLoadPage(page));
  },
  dynamicCatalogSpinnerPage: async ({ page }, use) => {
    await use(new DynamicCatalogSpinnerPage(page));
  },
  dynamicCatalogSliderPage: async ({ page }, use) => {
    await use(new DynamicCatalogSliderPage(page));
  },
  cartItems: async ({}, use) => {
    await use([]);
  },
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
