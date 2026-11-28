# Catalog sorting coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

Existing specs add products and check a single product's details. No spec calls or asserts `InventoryPage.sortBy`. CLI exploration exercised all four modes with Backpack selected: selection remained, badge stayed 1, and the six product identities/prices were preserved.

Observed ascending names: Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() T-Shirt (Red), with their full Sauce Labs names on screen. Ascending prices: `$7.99`, `$9.99`, `$15.99`, `$15.99`, `$29.99`, `$49.99`; descending prices reverse the numeric ordering. Two products cost `$15.99`; their tie order is not an established requirement.

## Scenarios

### SORT-01 — All sorting modes preserve the catalog (P1)

1. Login to an empty cart and capture the six product names and their associated prices.
2. Independently select Name A to Z, Name Z to A, Price low to high, or Price high to low.
3. Expect the selected option and the corresponding name or numeric price ordering across all six cards.
4. Expect exactly the original name/price pairs, no missing or duplicated product identity, and an empty cart. Compare prices in integer cents; do not impose an order between equal prices.

### SORT-02 — Sorting preserves an existing selection (P1)

1. Login, add Backpack, verify badge 1 and its Remove action.
2. Change through all four sort modes, checking ordering after each transition.
3. After every transition expect Backpack still selected, every other product Add to cart, and badge 1.
4. Open the cart; expect only Backpack, quantity 1, price `$29.99`.

### SORT-03 — Act on the correct item after sorting (P1, proposed extension)

1. Login with an empty cart; sort Price low to high.
2. Add Onesie by its product identity, then sort Price high to low and add Fleece Jacket.
3. Expect badge 2; open cart and verify exactly Onesie `$7.99` and Jacket `$49.99`, each quantity 1.
4. Return to Products, remove Onesie by identity in the sorted catalog, and verify only Jacket remains in the cart. This action sequence was not executed during exploration.

## PageObject handoff

Reuse `inventoryPage` and `cartPage`. Expose ordered product names/prices and selected sort state through `InventoryPage`; keep row scoping in that class. Avoid using a product's current numeric position as its identity.

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. The original audit observations above are historical; the generated specs are mapped below.

## Generated automation

Implemented using the Playwright CLI skill on 28 November 2026. Each scenario has its own spec file; parameter variants remain independent tests/contexts. Shared setup and cleanup hooks use injected PageObjects.

| Scenario | Spec |
| --- | --- |
| SORT-01 | [all-sort-modes.spec.ts](../../tests/coverage-gaps/catalog/all-sort-modes.spec.ts) |
| SORT-02 | [sorting-preserves-selection.spec.ts](../../tests/coverage-gaps/catalog/sorting-preserves-selection.spec.ts) |
| SORT-03 | [act-on-sorted-products.spec.ts](../../tests/coverage-gaps/catalog/act-on-sorted-products.spec.ts) |
