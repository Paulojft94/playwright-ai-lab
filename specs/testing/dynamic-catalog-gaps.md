# Dynamic Catalog coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

No current test spec references any Dynamic Catalog route. CLI exploration reached all three through Menu → Dynamic Catalog. These views showed product browsing controls; no Add to cart actions were observed. Do not assume the standard shopping catalog's interactions exist here.

- Lazy Load: `/dynamic-catalog-lazy-load.html`, title Dynamic Catalog - Lazy Load; initially 12 cards. Scrolling to the bottom appended cards and exposed Loading… placeholders. The end of the dataset was not explored. Display names can repeat; name uniqueness is not a valid assertion.
- Spinner: `/dynamic-catalog-spinner.html`, title Dynamic Catalog - Spinner; a status named Loading preceded a six-product grid.
- Slider: `/dynamic-catalog-slider.html`, title Dynamic Catalog - Slider; one product card and six Show [product] controls. Product content cycled automatically between snapshots. Clicking Show Sauce Labs Backpack was followed by already-advanced content; manual selection correctness and timing remain unverified.

## Scenarios

### DYN-01 — Lazy loading appends coherent product cards (P1)

1. Login with empty cart; navigate to Lazy Load. Expect its URL/title and the initial 12 complete cards with nonempty names, images and currency prices.
2. Scroll the list sentinel into view. Observe Loading… when detectable, then wait for additional complete cards rather than sleeping.
3. Expect original card identities/order preserved as a prefix, more than 12 complete cards, and no duplicate stable card identity. Repeated display names are allowed.
4. Expect temporary placeholders in the requested batch to resolve; cart remains empty.
5. Stable IDs such as `lazy-load-item-0` were present. Verify their contract when implementing; do not hardcode snapshot refs or an unobserved final item count.

### DYN-02 — Spinner transitions from loading to content (P1)

1. Login and navigate to Spinner. Observe Loading status before the grid, then wait for the six complete default-product cards.
2. Expect loading to disappear, six name/price pairs consistent with the standard catalog, and no empty cards or cart mutation.
3. Reload and verify completion again. Reload is a proposed extension.
4. If native loading is too brief, establish a verified request/timer control before asserting the transient state; do not make the test depend on catching a short animation. Failure/network-retry semantics were not explored and need their own contract.

### DYN-03 — Slider controls select the requested product (P1, investigate)

1. Login; navigate to Slider. Expect one displayed product and six named Show controls.
2. Establish a deterministic clock/timer strategy supported by the implementation; select Backpack and inspect immediately before automatic advancement.
3. Proposed acceptance: visible product name, description, image and `$29.99` all belong to Backpack; selection indication agrees with visible content.
4. Repeat for Bike Light (`$9.99`), then a third product; exactly one card remains visible.
5. This expectation is unconfirmed by the manual probe because auto-advance occurred between observations. Capture a controlled trace to distinguish a defect from timer timing; do not weaken the assertion to whichever product happens to appear.

### DYN-04 — Slider auto-advance keeps card content consistent (P2)

1. Login and navigate to Slider; capture the current product and its associated fields.
2. Observe a subsequent product without clicking a selector; expect the name to change and its price/image/description to change as one coherent card.
3. Proposed extension: use controlled time to advance through the available products and wrap around without blank or mixed content.
4. No exact cycle interval was measured. Determine it from a verified implementation/contract before choosing clock increments; assert eventual visible change with bounded waiting for an uncontrolled smoke check.

## PageObject handoff

Add separate `DynamicCatalogLazyLoadPage`, `DynamicCatalogSpinnerPage`, and `DynamicCatalogSliderPage` classes, each in its own file under `page-object/`. Register corresponding typed fixtures under `fixtures/`, expose them through `fixtures/pages.ts`, and update the engineering route map when implementing. Keep loading locators, sentinel scrolling, card identity/field access and slider actions inside their owning PageObjects.

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. This document plans future tests; it does not claim they have run.
