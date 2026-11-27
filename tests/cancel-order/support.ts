import { test, expect, type PageFixtures } from "../../fixtures/pages";
import { backpack, type CartItem } from "../../test-data/products";
import { usersData } from "../../test-data/users";

type TitledPage = Pick<PageFixtures["cartPage"], "page" | "title">;
type CartHeader = Pick<PageFixtures["cartPage"], "cartBadge" | "cartLink">;
type SelectionPage = Pick<PageFixtures["cartPage"],
  "items" | "cartBadge" | "item" | "itemName" | "itemQuantity" | "itemPrice"
>;

export async function expectStage(view: TitledPage, path: string, title: string) {
  await expect(view.page).toHaveURL(new URL(path, "https://www.saucedemo.com/").href);
  await expect(view.title).toHaveText(title);
}

export async function expectNoCompletion(complete: PageFixtures["checkoutCompletePage"]) {
  await expect(complete.page).not.toHaveURL(/\/checkout-complete\.html$/);
  await expect(complete.header).not.toBeVisible();
  await expect(complete.dispatchMessage).not.toBeVisible();
}

export async function expectEmptyBadge(view: CartHeader) {
  await expect(view.cartBadge).toHaveCount(0);
  await expect(view.cartLink).toHaveAccessibleName("Cart, empty");
}

export async function expectEmptyCart(
  cart: PageFixtures["cartPage"], complete: PageFixtures["checkoutCompletePage"],
) {
  await expectStage(cart, "/cart.html", "Your Cart");
  await expect(cart.items).toHaveCount(0);
  await expectEmptyBadge(cart);
  await expectNoCompletion(complete);
}

export async function expectSelection(view: SelectionPage, items: readonly CartItem[]) {
  await expect(view.items).toHaveCount(items.length);
  await expect(view.cartBadge).toHaveText(String(items.length));
  for (const item of items) {
    await expect(view.item(item.name)).toHaveCount(1);
    await expect(view.itemName(item.name)).toHaveText(item.name);
    await expect(view.itemQuantity(item.name)).toHaveText("1");
    await expect(view.itemPrice(item.name)).toHaveText(item.price);
  }
}

export async function expectCart(
  cart: PageFixtures["cartPage"], items: readonly CartItem[],
  complete: PageFixtures["checkoutCompletePage"],
) {
  await expectStage(cart, "/cart.html", "Your Cart");
  await expectSelection(cart, items);
  await expectNoCompletion(complete);
}

export async function openCart(
  inventory: PageFixtures["inventoryPage"], cart: PageFixtures["cartPage"],
) {
  await inventory.goToCart();
  await expectStage(cart, "/cart.html", "Your Cart");
}

export async function openCustomerInformation(
  cart: PageFixtures["cartPage"], information: PageFixtures["checkoutInformationPage"],
  itemCount = 1,
) {
  await cart.goToCheckout();
  await expectStage(information, "/checkout-step-one.html", "Checkout: Your Information");
  await expect(information.cartBadge).toHaveText(String(itemCount));
}

export async function fillCustomerInformation(information: PageFixtures["checkoutInformationPage"]) {
  await information.fillUserInformation("Ana", "Silva", "1000-001");
}

export async function openOverview(
  cart: PageFixtures["cartPage"], information: PageFixtures["checkoutInformationPage"],
  overview: PageFixtures["checkoutOverviewPage"], itemCount = 1,
) {
  await openCustomerInformation(cart, information, itemCount);
  await fillCustomerInformation(information);
  await information.clickContinue();
  await expectStage(overview, "/checkout-step-two.html", "Checkout: Overview");
}

export function registerCartHooks(products: readonly CartItem[] = [backpack]) {
  test.beforeEach(async ({ loginPage, inventoryPage, cartPage, checkoutCompletePage, cartItems }) => {
    await loginPage.goto();
    await loginPage.login(usersData.username, usersData.password);
    await expectStage(inventoryPage, "/inventory.html", "Products");
    await expectEmptyBadge(inventoryPage);
    for (const product of products) {
      await expect(inventoryPage.item(product.name)).toHaveCount(1);
      await expect(inventoryPage.itemPrice(product.name)).toHaveText(product.price);
      cartItems.push({
        name: await inventoryPage.itemName(product.name).innerText(),
        price: await inventoryPage.itemPrice(product.name).innerText(),
      });
      await inventoryPage.addItemToCart(product.name);
      await expect(inventoryPage.removeButton(product.name)).toBeVisible();
    }
    await expect(inventoryPage.cartBadge).toHaveText(String(products.length));
    await openCart(inventoryPage, cartPage);
    await expectCart(cartPage, cartItems, checkoutCompletePage);
  });

  test.afterEach(async ({ cartPage, checkoutCompletePage }) => {
    if (cartPage.page.isClosed()) return;
    await cartPage.goto();
    await cartPage.clear();
    await expectEmptyCart(cartPage, checkoutCompletePage);
  });
}
