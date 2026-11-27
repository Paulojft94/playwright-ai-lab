// spec: specs/testing/cancel-order.md (CART-CANCEL-01 through CART-CANCEL-08)
import { test, expect } from "../../fixtures/pages";
import { backpack, bikeLight } from "../../test-data/products";
import {
  expectCart,
  expectEmptyBadge,
  expectEmptyCart,
  expectNoCompletion,
  expectSelection,
  expectStage,
  fillCustomerInformation,
  openCart,
  openCustomerInformation,
  openOverview,
  registerCartHooks,
} from "./support";

test.describe("Cart cancellation — one item", () => {
  registerCartHooks();

  test.describe("Clear or edit the pending cart", () => {

    // CART-CANCEL-01
    test("remove-the-only-item-from-cart", async ({ inventoryPage, cartPage, checkoutCompletePage }) => {
      // 1. Click Remove within the Backpack row.
      await cartPage.removeItem(backpack.name);
      await expectEmptyCart(cartPage, checkoutCompletePage);

      // 2. Inspect the page after removal.
      await expect(cartPage.continueShoppingButton).toBeVisible();
      await expect(cartPage.checkoutButton).toBeVisible();
      await expectNoCompletion(checkoutCompletePage);

      // 3. Click Continue Shopping.
      await cartPage.continueShopping();
      await expectStage(inventoryPage, "/inventory.html", "Products");
      await expectEmptyBadge(inventoryPage);
      await expect(inventoryPage.addButton(backpack.name)).toBeVisible();
    });

    // CART-CANCEL-03
    test("keep-a-removed-item-absent-after-reload", async ({ inventoryPage, cartPage, checkoutCompletePage }) => {
      // 1. Remove Backpack and confirm the cart is empty.
      await cartPage.removeItem(backpack.name);
      await expectEmptyCart(cartPage, checkoutCompletePage);

      // 2. Reload the cart in the same authenticated browser session.
      await cartPage.reload();
      await expectEmptyCart(cartPage, checkoutCompletePage);

      // 3. Click Continue Shopping and reopen the cart.
      await cartPage.continueShopping();
      await expectStage(inventoryPage, "/inventory.html", "Products");
      await openCart(inventoryPage, cartPage);
      await expectEmptyCart(cartPage, checkoutCompletePage);
    });

    // CART-CANCEL-04
    test("re-add-an-item-after-clearing-the-cart", async ({ inventoryPage, cartPage, checkoutCompletePage, cartItems }) => {
      // 1. Remove Backpack and confirm an empty cart.
      await cartPage.removeItem(backpack.name);
      await expectEmptyCart(cartPage, checkoutCompletePage);

      // 2. Click Continue Shopping and add Backpack once.
      await cartPage.continueShopping();
      await expectStage(inventoryPage, "/inventory.html", "Products");
      await inventoryPage.addItemToCart(backpack.name);
      await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
      await expect(inventoryPage.cartBadge).toHaveText("1");

      // 3. Open the cart.
      await openCart(inventoryPage, cartPage);
      await expectCart(cartPage, cartItems, checkoutCompletePage);
    });
  });

  test.describe("Abandon checkout while preserving the cart", () => {

    // CART-CANCEL-05
    test("cancel-checkout-from-customer-information-blank-fields", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
      // 1. Click Checkout.
      await openCustomerInformation(cartPage, checkoutInformationPage);

      // 2. Prepare the blank-fields variant without clicking Continue.
      await expect(checkoutInformationPage.firstName).toBeEmpty();
      await expect(checkoutInformationPage.lastName).toBeEmpty();
      await expect(checkoutInformationPage.postalCode).toBeEmpty();

      // 3. Click Cancel.
      await checkoutInformationPage.cancel();
      await expectCart(cartPage, cartItems, checkoutCompletePage);
      await expect(checkoutInformationPage.error).not.toBeVisible();
    });

    // CART-CANCEL-05
    test("cancel-checkout-from-customer-information-complete-details", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
      // 1. Click Checkout.
      await openCustomerInformation(cartPage, checkoutInformationPage);

      // 2. Prepare the complete-details variant without clicking Continue.
      await fillCustomerInformation(checkoutInformationPage);

      // 3. Click Cancel.
      await checkoutInformationPage.cancel();
      await expectCart(cartPage, cartItems, checkoutCompletePage);
      await expect(checkoutInformationPage.error).not.toBeVisible();
    });

    // CART-CANCEL-05
    test("cancel-checkout-from-customer-information-partial-details", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
      // 1. Click Checkout.
      await openCustomerInformation(cartPage, checkoutInformationPage);

      // 2. Prepare the partial-details variant without clicking Continue.
      await checkoutInformationPage.fillUserInformation("Ana", "", "");

      // 3. Click Cancel.
      await checkoutInformationPage.cancel();
      await expectCart(cartPage, cartItems, checkoutCompletePage);
      await expect(checkoutInformationPage.error).not.toBeVisible();
    });

    // CART-CANCEL-06
    test("cancel-after-a-customer-information-validation-error", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
      // 1. Click Checkout and Continue with all customer fields empty.
      await openCustomerInformation(cartPage, checkoutInformationPage);
      await checkoutInformationPage.clickContinue();
      await expectStage(checkoutInformationPage, "/checkout-step-one.html", "Checkout: Your Information");
      await expect(checkoutInformationPage.error).toHaveText("Error: First Name is required");

      // 2. Click Cancel while the error is visible.
      await checkoutInformationPage.cancel();
      await expectCart(cartPage, cartItems, checkoutCompletePage);
      await expect(checkoutInformationPage.error).not.toBeVisible();
    });

    // CART-CANCEL-07
    test("cancel-checkout-from-order-overview-single-item", async ({ inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage, cartItems }) => {
      // 1. Click Checkout, enter valid customer details, and Continue.
      await openOverview(cartPage, checkoutInformationPage, checkoutOverviewPage, 1);
      await expectSelection(checkoutOverviewPage, cartItems);
      await expect(checkoutOverviewPage.subtotal).toHaveText("Item total: $29.99");
      await expect(checkoutOverviewPage.tax).toHaveText("Tax: $2.40");
      await expect(checkoutOverviewPage.total).toHaveText("Total: $32.39");
      await expectNoCompletion(checkoutCompletePage);

      // 2. Click Cancel rather than Finish.
      await checkoutOverviewPage.cancel();
      await expectStage(inventoryPage, "/inventory.html", "Products");
      await expect(inventoryPage.cartBadge).toHaveText("1");
      for (const item of cartItems) {
        await expect(inventoryPage.removeButton(item.name)).toBeVisible();
      }
      await expectNoCompletion(checkoutCompletePage);

      // 3. Reopen the cart.
      await openCart(inventoryPage, cartPage);
      await expectCart(cartPage, cartItems, checkoutCompletePage);
    });

    // CART-CANCEL-08
    test("clear-the-cart-after-abandoning-checkout-customer-information", async ({ cartPage, checkoutInformationPage, checkoutCompletePage, cartItems }) => {
      // 1. Abandon checkout through the customer-information route.
      await openCustomerInformation(cartPage, checkoutInformationPage);
      await checkoutInformationPage.fillUserInformation("Ana", "", "");
      await checkoutInformationPage.cancel();
      await expectCart(cartPage, cartItems, checkoutCompletePage);

      // 2. Click Remove within the Backpack row.
      await cartPage.removeItem(backpack.name);
      await expectEmptyCart(cartPage, checkoutCompletePage);

      // 3. Reload the cart.
      await cartPage.reload();
      await expectEmptyCart(cartPage, checkoutCompletePage);
    });

    // CART-CANCEL-08
    test("clear-the-cart-after-abandoning-checkout-order-overview", async ({ inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage, cartItems }) => {
      // 1. Abandon checkout through the order-overview route.
      await openOverview(cartPage, checkoutInformationPage, checkoutOverviewPage);
      await checkoutOverviewPage.cancel();
      await expectStage(inventoryPage, "/inventory.html", "Products");
      await openCart(inventoryPage, cartPage);
      await expectCart(cartPage, cartItems, checkoutCompletePage);

      // 2. Click Remove within the Backpack row.
      await cartPage.removeItem(backpack.name);
      await expectEmptyCart(cartPage, checkoutCompletePage);

      // 3. Reload the cart.
      await cartPage.reload();
      await expectEmptyCart(cartPage, checkoutCompletePage);
    });
  });
});

test.describe("Cart cancellation — two items", () => {
  registerCartHooks([backpack, bikeLight]);

  test.describe("Clear or edit the pending cart", () => {

    // CART-CANCEL-02
    test("remove-one-item-without-removing-another", async ({ inventoryPage, cartPage, checkoutCompletePage, cartItems }) => {
      const remaining = cartItems.filter(item => item.name === bikeLight.name);

      // 1. Click Remove specifically within the Backpack row.
      await cartPage.removeItem(backpack.name);
      await expectCart(cartPage, remaining, checkoutCompletePage);
      await expect(cartPage.item(backpack.name)).toHaveCount(0);

      // 2. Click Continue Shopping, then reopen the cart.
      await cartPage.continueShopping();
      await expectStage(inventoryPage, "/inventory.html", "Products");
      await openCart(inventoryPage, cartPage);
      await expectCart(cartPage, remaining, checkoutCompletePage);
      await expect(cartPage.item(backpack.name)).toHaveCount(0);

      // 3. Remove Bike Light.
      await cartPage.removeItem(bikeLight.name);
      await expectEmptyCart(cartPage, checkoutCompletePage);
    });
  });

  test.describe("Abandon checkout while preserving the cart", () => {

    // CART-CANCEL-07
    test("cancel-checkout-from-order-overview-two-items", async ({ inventoryPage, cartPage, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage, cartItems }) => {
      // 1. Click Checkout, enter valid customer details, and Continue.
      await openOverview(cartPage, checkoutInformationPage, checkoutOverviewPage, 2);
      await expectSelection(checkoutOverviewPage, cartItems);
      await expectNoCompletion(checkoutCompletePage);

      // 2. Click Cancel rather than Finish.
      await checkoutOverviewPage.cancel();
      await expectStage(inventoryPage, "/inventory.html", "Products");
      await expect(inventoryPage.cartBadge).toHaveText("2");
      for (const item of cartItems) {
        await expect(inventoryPage.removeButton(item.name)).toBeVisible();
      }
      await expectNoCompletion(checkoutCompletePage);

      // 3. Reopen the cart.
      await openCart(inventoryPage, cartPage);
      await expectCart(cartPage, cartItems, checkoutCompletePage);
    });
  });
});
