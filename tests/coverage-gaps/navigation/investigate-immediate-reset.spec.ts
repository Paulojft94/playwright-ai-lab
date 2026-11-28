// spec: specs/testing/navigation-reset-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks, addProducts, expectSelection } from "../support";
import { backpack } from "../../../test-data/products";
registerHooks();


test("RESET-01 — Investigate immediate reset state and verify cart clearing", {
  annotation: { type: "investigation", description: "User requested investigation of immediate button consistency; do not enforce the unresolved requirement." },
}, async ({ menu, inventoryPage, cartPage }, testInfo) => {
  // 1. Establish the selection in both catalog and cart.
  await addProducts(inventoryPage, [backpack]);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack]);
  await cartPage.continueShopping();
  // 2. Reset and collect the unresolved immediate button state.
  await menu.reset();
  await expect(inventoryPage.title).toHaveText("Products");
  await expect(inventoryPage.cartBadge).toHaveCount(0);
  const immediateState = {
    backpackAddVisible: await inventoryPage.addButton(backpack.name).isVisible(),
    backpackRemoveVisible: await inventoryPage.removeButton(backpack.name).isVisible(),
    screenshot: "immediate-reset.png",
  };
  await testInfo.attach("immediate reset state (investigation)", {
    body: JSON.stringify(immediateState, null, 2), contentType: "application/json",
  });
  await testInfo.attach("immediate reset screenshot", {
    body: await inventoryPage.page.screenshot(), contentType: "image/png",
  });
  if (immediateState.backpackRemoveVisible) {
    testInfo.annotations.push({ type: "discrepancy", description: "Badge is empty but Backpack still offers Remove immediately after reset." });
  }
  // 3. Cart clearing and adding once after remount are confirmed contracts.
  await inventoryPage.goToCart();
  await expect(cartPage.items).toHaveCount(0);
  await expect(cartPage.cartBadge).toHaveCount(0);
  await cartPage.continueShopping();
  await expect(inventoryPage.addButton(backpack.name)).toBeVisible();
  await inventoryPage.addItemToCart(backpack.name);
  await inventoryPage.goToCart();
  await expectSelection(cartPage, [backpack]);
});
