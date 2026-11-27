# Order completion and PDF receipt coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

Current order specs complete only a Backpack order. They assert Back Home and Generate PDF are visible, without invoking them. The cancellation suite reaches two-item overview but does not assert its aggregate totals or finish. ORD-02/11/12 in [order.md](order.md) already describe related backlog; these are concrete gap refinements, not additional duplicate scenarios to implement alongside them.

CLI exploration completed Backpack + Bike Light for Ana Silva / `1000-001`. Overview showed subtotal `$39.98`, tax `$3.20`, total `$43.18`. Generate PDF downloaded a 3,046-byte `%PDF-1.3` file. Extracted text contained Order Receipt, Ana Silva, postal code, both product names/prices and all three totals. Back Home returned to Products with empty cart and Add to cart available for Backpack. This confirms a UI completion/download, not an actual payment or shipment.

## Scenarios

### COMPLETE-01 — Complete a two-product order with correct totals (P0)

1. Login; add Backpack and Bike Light, then verify exactly those cart rows, quantity 1, prices `$29.99` and `$9.99`, badge 2.
2. Enter Ana / Silva / `1000-001` and continue to overview.
3. Expect both items unchanged, subtotal `$39.98`, tax `$3.20`, total `$43.18`, payment `SauceCard #31337` and shipping `Free Pony Express Delivery!`.
4. Compute the line sum in cents; expect subtotal equals that sum and total equals subtotal plus displayed tax. Fixed tax values are the observed demo baseline, not proof of a general tax policy.
5. Finish; expect completion URL/title, Thank you for your order!, download/home controls and empty badge.

### PDF-01 — Download a receipt matching the completed order (P1)

1. Independently set up and finish COMPLETE-01's two-product order; capture the displayed customer/order values within this test.
2. Start waiting for the download before clicking Generate PDF. Expect a successful, nonempty `.pdf` download with the `swag-labs-order-` filename prefix; do not assert a fixed timestamp or exact byte length.
3. Validate PDF signature and parse the document using a suitable PDF reader. Expect Order Receipt, Ana Silva, `1000-001`, both names/prices, subtotal `$39.98`, tax `$3.20`, total `$43.18`, agreeing with the overview.
4. Expect completion page and empty cart unchanged after download. A header alone is insufficient receipt-content coverage. Do not require a quantity column: none was observed.
5. Save the file as a per-test artifact; remove temporary files in cleanup. PDF visual layout, accessibility and rendering quality were not inspected in this audit.

### COMPLETE-02 — Back Home starts a new independent purchase (P1)

1. Login and finish a Backpack order for Ana Silva / `1000-001`; click Back Home.
2. Expect Products, empty cart and Backpack Add to cart. Open Cart; expect no completed-order rows.
3. Return to Products, add only Bike Light and complete checkout as Ben Costa / `2000-002`.
4. Expect only Bike Light on overview, subtotal `$9.99`, tax `$0.80`, total `$10.79` using the current demo tax assumption; Finish succeeds and empties the cart.
5. Download its PDF and expect the second customer/item/totals, without Ana/Backpack data from the earlier purchase. The second purchase and stale-receipt assertions are proposed extensions, not explored.

## PageObject handoff

Reuse all existing shopping PageObject fixtures. Exercise `checkoutCompletePage.backHome` and `downloadOrderPdf` through their owning PageObject; verify its download helper starts the event wait before the click. Keep PDF parsing in a focused non-UI helper, with the scenario's business assertions explicit in the spec. Do not construct PageObjects in that helper or share downloads between tests.

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. This document plans future tests; it does not claim they have run.
