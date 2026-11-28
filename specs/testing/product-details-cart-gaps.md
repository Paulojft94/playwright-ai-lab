# Product details and cart persistence coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

`tests/product-details.spec.ts` tests Backpack details, adding, returning to Products and the resulting cart row. Cancellation specs test empty-cart reload and removal from cart. They do not test removing from details or reloading a populated cart.

CLI exploration opened Bike Light details (`/inventory-item.html?id=0`, `$9.99`) with Backpack already selected. Adding Bike Light increased the badge to 2; removing it on details reduced the badge to 1 and left only Backpack in the cart. Reloading that populated cart preserved Backpack, quantity 1 and `$29.99`.

## Scenarios

### DETAIL-01 — Remove from details without losing another item (P1)

1. Login; add Backpack on Products and verify badge 1.
2. Open Bike Light details; expect id 0, its exact name, description and `$9.99`.
3. Add it; expect Remove and badge 2. Remove it; expect Add to cart and badge 1.
4. Open Cart; expect only Backpack, quantity 1, `$29.99`, and no Bike Light row.
5. Return to Products; expect Backpack Remove and Bike Light Add to cart. Step 5 is an extension of the observed sequence.

### DETAIL-02 — Product identity agrees across entry points (P2, proposed extension)

1. Independently use the image control or name control to open Bike Light from Products.
2. Expect id 0, the same name, description and price as its catalog card; exactly one details container must own those locators.
3. Return to Products; expect all six products and no cart mutation.
4. Parameterize another distinct product after verifying its live route/data. Only the name entry point for Bike Light was exercised in this audit; image navigation remains to verify.

### CART-01 — Populated cart survives reload (P1)

1. Login, add Backpack, open Cart and verify exactly its row, quantity 1 and `$29.99`.
2. Reload the cart; expect authenticated `/cart.html`, Your Cart, the same row and badge 1.
3. Continue Shopping; expect Backpack selected. Reopen Cart; expect no duplicate row.
4. Extend independently to Backpack plus Bike Light and verify both name/price pairs. Two-item reload was not explored; retain separate assertions for that variant.

## PageObject handoff

Reuse `inventoryPage`, `productDetailsPage`, and `cartPage`. Details locators must stay scoped to their details container, avoiding transient matches against the six catalog cards. Expose image/name entry methods in `InventoryPage` if needed. Reuse `ProductDetailsPage.removeFromCart`; a method's existence alone is not coverage. CART-01 refines the still-unimplemented populated persistence case in [order.md](order.md), ORD-13.

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. The original audit observations above are historical; the generated specs are mapped below.

## Generated automation

Implemented using the Playwright CLI skill on 28 November 2026. Each scenario has its own spec file; parameter variants remain independent tests/contexts. Shared setup and cleanup hooks use injected PageObjects.

| Scenario | Spec |
| --- | --- |
| DETAIL-01 | [remove-from-details.spec.ts](../../tests/coverage-gaps/details-cart/remove-from-details.spec.ts) |
| DETAIL-02 | [details-entry-points.spec.ts](../../tests/coverage-gaps/details-cart/details-entry-points.spec.ts) |
| CART-01 | [populated-cart-reload.spec.ts](../../tests/coverage-gaps/details-cart/populated-cart-reload.spec.ts) |
