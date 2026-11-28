# Dynamic Catalog coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

No current test spec references any Dynamic Catalog route. CLI exploration reached all three through Menu → Dynamic Catalog. These views showed product browsing controls; no Add to cart actions were observed. Do not assume the standard shopping catalog's interactions exist here.

- Lazy Load: `/dynamic-catalog-lazy-load.html`, title Dynamic Catalog - Lazy Load; initially 12 cards. Scrolling to the bottom appended cards and exposed Loading… placeholders. The end of the dataset was not explored. Display names can repeat; name uniqueness is not a valid assertion.
- Spinner: `/dynamic-catalog-spinner.html`, title Dynamic Catalog - Spinner; a status named Loading preceded a six-product grid.
- Slider: `/dynamic-catalog-slider.html`, title Dynamic Catalog - Slider; one product card and six Show [product] controls. Product content cycled automatically between snapshots. Clicking Show Sauce Labs Backpack was followed by already-advanced content; manual selection correctness and timing remain unverified.

## Scenarios

### DYN-01 — Lazy loading appends coherent product cards (P1)

1. Login with empty cart; navigate to Lazy Load. Expect its URL/title and an initial batch of at least six loaded cards. Record the current stable identities/count. The earlier desktop exploration showed 12, but initial append count depends on viewport intersection; do not require exactly 12 across viewports.
2. Scroll the list sentinel into view. Observe Loading… when detectable, then wait for additional complete cards rather than sleeping.
3. Expect the original card identities/order preserved as a prefix, at least one additional six-card batch, and no duplicate stable card identity. Repeated display names are allowed.
4. Bring each requested card into view and expect its placeholder to resolve into a nonempty name, matching image alternative text and currency price; cart remains empty. Source inspection confirmed loading is triggered by IntersectionObserver, rather than a timer.
5. Stable IDs such as `lazy-load-item-0` were present. Verify their contract when implementing; do not hardcode snapshot refs or an unobserved final item count.

### DYN-02 — Spinner transitions from loading to content (P1)

1. Login and navigate to Spinner. Observe Loading status before the grid, then wait for the six complete default-product cards.
2. Expect loading to disappear, six name/price pairs consistent with the standard catalog, and no empty cards or cart mutation.
3. Reload and verify completion again. Reload is a proposed extension.
4. If native loading is too brief, establish a verified request/timer control before asserting the transient state; do not make the test depend on catching a short animation. Failure/network-retry semantics were not explored and need their own contract.

### DYN-03 — Slider controls select the requested product (P1)

1. Login; navigate to Slider. Expect one displayed product and six named Show controls.
2. Establish a deterministic clock/timer strategy supported by the implementation; select Backpack and inspect immediately before automatic advancement.
3. Proposed acceptance: visible product name, image and `$29.99` all belong to Backpack; selection indication agrees with visible content.
4. Repeat for Bike Light (`$9.99`), then a third product; exactly one card remains visible.
5. Generation confirmed this expectation with a paused clock. The live slider card has no description field; name, price, image source/alternative text and aria-current are the coherent fields to assert.

### DYN-04 — Slider auto-advance keeps card content consistent (P2)

1. Login and navigate to Slider; capture the current product and its associated fields.
2. Observe a subsequent product without clicking a selector; expect the name to change and its price/image to change as one coherent card.
3. Proposed extension: use controlled time to advance through the available products and wrap around without blank or mixed content.
4. Generation inspected the live application bundle and verified a 2000ms interval. Install/pause the clock after login but before direct navigation to this route, then use 2000ms increments. Keep cookie creation on real time; do not freeze a historical date before login.

## Controlled loading and navigation

Generation verified the source bundle `assets/index-DnLqFcJI.js`: Spinner delay is `500 + Math.random() * 2500` ms, Slider interval is 2000ms, and lazy cards use IntersectionObserver. These tests pause the browser clock after login, then navigate directly through the owning page's `goto` method. Advance 3001ms for each Spinner transition and 2000ms per Slider step. This avoids freezing the menu's opening timer; NAV-01 separately tests every menu route. No fixed sleeps are used.

## PageObject handoff

Add separate `DynamicCatalogLazyLoadPage`, `DynamicCatalogSpinnerPage`, and `DynamicCatalogSliderPage` classes, each in its own file under `page-object/`. Register corresponding typed fixtures under `fixtures/`, expose them through `fixtures/pages.ts`, and update the engineering route map when implementing. Keep loading locators, sentinel scrolling, card identity/field access and slider actions inside their owning PageObjects.

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. The original audit observations above are historical; the generated specs are mapped below.

## Generated automation

Implemented using the Playwright CLI skill on 28 November 2026. Each scenario has its own spec file; parameter variants remain independent tests/contexts. Shared setup and cleanup hooks use injected PageObjects.

| Scenario | Spec |
| --- | --- |
| DYN-01 | [lazy-loading-appends-cards.spec.ts](../../tests/coverage-gaps/dynamic-catalog/lazy-loading-appends-cards.spec.ts) |
| DYN-02 | [spinner-transitions-to-content.spec.ts](../../tests/coverage-gaps/dynamic-catalog/spinner-transitions-to-content.spec.ts) |
| DYN-03 | [slider-manual-selection.spec.ts](../../tests/coverage-gaps/dynamic-catalog/slider-manual-selection.spec.ts) |
| DYN-04 | [slider-automatic-rotation.spec.ts](../../tests/coverage-gaps/dynamic-catalog/slider-automatic-rotation.spec.ts) |
