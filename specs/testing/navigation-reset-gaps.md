# Navigation and Reset App State coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

No current spec asserts menu navigation or Reset App State. The observed menu contains All Items, Dynamic Catalog (Lazy Load, Spinner, Slider), About, Logout and Reset App State.

**Observed inconsistency:** with Backpack selected on Products, Reset App State cleared the badge to empty but left Backpack showing Remove. This persisted in subsequent snapshots. Navigating away to Dynamic Catalog and back through All Items restored all Add to cart buttons. Immediate post-reset cart contents were not inspected; do not infer them from the badge. Do not encode the stale Remove button as correct behavior.

## Scenarios

### NAV-01 — All Items returns from a Dynamic Catalog page (P2)

1. Login; open Menu, expand Dynamic Catalog and select Lazy Load.
2. Expect `/dynamic-catalog-lazy-load.html` and Dynamic Catalog - Lazy Load.
3. Open Menu and choose All Items; expect `/inventory.html`, Products, all six catalog cards and unchanged empty cart.
4. Independently repeat for Spinner and Slider. Route navigation for these pages and the return from Slider were observed; the full independent matrix is an extension.

### RESET-01 — Reset produces a coherent empty selection (P0, discrepancy)

1. Login; add Backpack and verify badge 1, Remove on its catalog card and a cart row.
2. Return to Products; use Menu → Reset App State, then close the menu.
3. Proposed acceptance: remain authenticated on Products; badge empty; every product Add to cart; cart contains no rows.
4. Return to Products and add Backpack once; expect badge 1 and exactly one cart row, quantity 1.
5. Record any disagreement among badge, button and cart as a failure. Exploration already contradicts step 3's immediate button expectation; obtain/reset the intended contract and fix or track the defect before claiming this passes.

### RESET-02 — Reset remains coherent after navigation and reload (P1, extension)

1. Login, add Backpack and Bike Light and verify both cart rows before invoking Reset on Products.
2. Navigate to a Dynamic Catalog page then All Items; expect empty badge and all Add to cart buttons.
3. Open Cart and reload; expect no rows and authenticated Your Cart.
4. Re-add Bike Light; expect one row at `$9.99` and badge 1.
5. Navigation/remount restored buttons in the single-item probe; the two-item and reload checks remain unverified. Keep this distinct from the immediate-state defect in RESET-01.

## PageObject handoff

Use the owning page fixture for each route and a shared menu component if helpful, under `page-object/` with one class per file. Expose menu open/close, All Items, submenu selection and reset actions through that abstraction. Add typed fixtures for Dynamic Catalog pages through `fixtures/pages.ts`. Avoid implementing menu actions as raw chains in tests. Logout is planned separately in [authentication-session-gaps.md](authentication-session-gaps.md).

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. This document plans future tests; it does not claim they have run.
