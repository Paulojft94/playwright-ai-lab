# Project-wide test automation patterns

This is the context file for test automation across this project. Read it before planning, generating, implementing, refactoring, reviewing, or healing Playwright tests. It applies to hand-written tests, MCP agents, and CLI/skill workflows. The repository's engineering instructions link here; maintain the detailed patterns in this file.

## Pipeline context

Read and follow [pipelines.md](pipelines.md) before planning, creating, modifying, or reviewing this project's test pipelines and GitHub Actions workflows. It is the project-wide context file for pipeline requirements, including execution commands, triggers, caching, reports, and artifacts. This applies to manual edits, MCP agents, and CLI/skill workflows.

When test automation changes affect pipeline execution, check the package scripts and Playwright configuration against that context. Maintain pipeline requirements in `pipelines.md` and reference them here rather than duplicating them in individual test plans.

## Core principle: use PageObjects

**New and refactored Playwright tests must use PageObjects instead of long, raw page call chains.** PageObject classes belong under `page-object/`, with one PageObject class per file and a separate class for each application page.

Follow [Playwright's Page Object Model documentation](https://playwright.dev/docs/pom): accept a typed Playwright `Page` in the constructor, capture reusable locators, and expose a higher-level API for the application's operations. Tests can assert against the PageObject's exposed locators. The additional file layout and lifecycle requirements below are this project's conventions.

## Page ownership and files

| Application page | Route | PageObject file / class |
| --- | --- | --- |
| Login | `/` | `page-object/LoginPage.ts` / `LoginPage` |
| Products | `/inventory.html` | `page-object/inventoryPage.ts` / `InventoryPage` |
| Product details | `/inventory-item.html?id=…` | `page-object/productDetailsPage.ts` / `ProductDetailsPage` |
| Cart | `/cart.html` | `page-object/cartPage.ts` / `CartPage` |
| Checkout information | `/checkout-step-one.html` | `page-object/checkoutInformationPage.ts` / `CheckoutInformationPage` |
| Checkout overview | `/checkout-step-two.html` | `page-object/checkoutOverviewPage.ts` / `CheckoutOverviewPage` |
| Dynamic Catalog Lazy Load | `/dynamic-catalog-lazy-load.html` | `page-object/dynamicCatalogLazyLoadPage.ts` / `DynamicCatalogLazyLoadPage` |
| Dynamic Catalog Spinner | `/dynamic-catalog-spinner.html` | `page-object/dynamicCatalogSpinnerPage.ts` / `DynamicCatalogSpinnerPage` |
| Dynamic Catalog Slider | `/dynamic-catalog-slider.html` | `page-object/dynamicCatalogSliderPage.ts` / `DynamicCatalogSliderPage` |
| Checkout complete | `/checkout-complete.html` | `page-object/checkoutCompletePage.ts` / `CheckoutCompletePage` |

- Keep exactly one PageObject class per file. Use PascalCase class names and `.ts` files; PageObjects are helpers, so their filenames must not end in `.spec.ts`.
- Reuse the existing class for a page. Do not create competing page abstractions in `tests/`, fixtures, or support modules.
- A page owns its own locators and interactions. In particular, `CartPage` must not fill checkout information or finish an order; those operations belong to the corresponding checkout pages.
- Follow the exact tracked filename case in imports: `LoginPage.ts` is capitalized, while the other existing/new page files use lower camel case. Linux CI is case-sensitive.
- Add a new class and update this route map when a new application page enters test scope. Shared UI components may be extracted when useful, with one component class per file; avoid a generic base-page framework without a concrete need.

## PageObject API conventions

- Declare the `Page` and reusable `Locator` fields `readonly`, initialize them in the constructor, and expose the locators needed for assertions.
- Use descriptive, page-specific action methods such as `login`, `addItemToCart`, `goToCheckout`, `fillUserInformation`, `clickContinue`, `cancel`, and `completeCheckout`.
- Keep selector construction inside PageObjects. Named-item methods such as `itemPrice(name)` should scope to that product, so tests do not reconstruct nested locator chains.
- Prefer the project's configured `getByTestId` (`data-test`) and verified role/name locators. Disambiguate repeated controls within their product rows; do not use transient browser snapshot refs in saved tests.
- Await interactions and navigation. Use Playwright's waiting assertions for stable page invariants when needed; do not introduce fixed sleeps or `networkidle` waits.
- Pass test data into methods. A PageObject must not choose users, fabricate scenario data, register hooks, or depend on another test's state.
- Keep classes focused on page behavior. Tests and workflow helpers orchestrate transitions across several PageObjects.

## Test and fixture conventions

- Put scenario intent, test data, and expected business outcomes in specs. Assert through PageObject locators, for example `await expect(checkoutInformationPage.title).toHaveText("Checkout: Your Information")`.
- Tests may use Playwright's browser/context APIs to establish isolation and inspect browser behavior. URL assertions on a PageObject's `page` are also valid. UI navigation and interactions still go through the relevant PageObject.
- Helpers and hooks follow the same rule: moving raw page chains into a support function does not make them PageObjects.
- Every PageObject must have a corresponding typed, test-scoped fixture saved under the root `fixtures/` directory. All tests and hooks must request those fixtures rather than construct PageObjects themselves; follow the fixture conventions below.
- Use `beforeEach` for scenario setup and `afterEach` for cleanup when the suite requires test data. Cart cancellation setup must add and verify at least one product before cancellation; cleanup removes any remaining items through `CartPage`.
- Each test gets its own context and required starting state. Do not share mutable PageObjects, a page, or cart data across tests. Hooks must support parallel execution and cleanup after a failure.
- Assert observable outcomes explicitly. Do not hide business expectations inside a generic method that makes the scenario unreadable, remove assertions to obtain a pass, or silently skip failures.

## PageObject fixtures: required for every page

**Create a fixture for each PageObject. All tests must consume PageObjects through fixtures instead of constructing their own instances.** This includes setup/cleanup hooks and workflow helpers: do not hide `new SomePage(page)` inside a test helper as a workaround.

### Save location and registration

- Save fixture definitions in the project's root **`fixtures/` directory**, alongside `fixtures/login.ts` and `fixtures/pages.ts`. Do not define PageObject fixtures inside `tests/`, `page-object/`, or a spec file.
- Use **`fixtures/pages.ts` as the shared test import and registration/composition entry point** for application PageObjects. It composes the existing login fixture from `fixtures/login.ts` through `fixtures/browserContexts.ts` and re-exports `expect`.
- Register a fixture when adding a PageObject; creating the class alone is incomplete. Reuse an existing fixture instead of registering or constructing another instance of the same page in a spec.
- Each page needs a distinct fixture, not necessarily a separate fixture file. If fixture definitions need splitting, keep their `.ts` files under `fixtures/` and compose them through `fixtures/pages.ts` so tests retain one import entry point.

| PageObject | Fixture name | Definition location |
| --- | --- | --- |
| `LoginPage` | `loginPage` | `fixtures/login.ts`, inherited by `fixtures/pages.ts` |
| `InventoryPage` | `inventoryPage` | `fixtures/pages.ts` |
| `ProductDetailsPage` | `productDetailsPage` | `fixtures/pages.ts` |
| `CartPage` | `cartPage` | `fixtures/pages.ts` |
| `CheckoutInformationPage` | `checkoutInformationPage` | `fixtures/pages.ts` |
| `CheckoutOverviewPage` | `checkoutOverviewPage` | `fixtures/pages.ts` |
| `DynamicCatalogLazyLoadPage` | `dynamicCatalogLazyLoadPage` | `fixtures/pages.ts` |
| `DynamicCatalogSpinnerPage` | `dynamicCatalogSpinnerPage` | `fixtures/pages.ts` |
| `DynamicCatalogSliderPage` | `dynamicCatalogSliderPage` | `fixtures/pages.ts` |
| `MenuComponent` (shared component) | `menu` | `fixtures/pages.ts` |
| `CheckoutCompletePage` | `checkoutCompletePage` | `fixtures/pages.ts` |

### Fixture implementation and lifetime

- Use a descriptive lower-camel-case fixture name matching its PageObject, and declare the PageObject's TypeScript type in the fixture type map.
- Construct PageObjects **only in their fixture definitions**, using the test-scoped Playwright `page`, then provide the instance through `await use(...)`. Do not use worker-scoped or global PageObjects, singleton instances, or shared mutable pages.
- Keep construction separate from scenario setup. A page fixture provides a PageObject; `beforeEach` calls its methods to log in, navigate, or create the scenario's cart data. `afterEach` uses injected fixtures to clean up that data.
- Pass injected PageObjects into workflow helpers instead of passing raw `page` and constructing classes inside those helpers.
- When a scenario needs an additional page or browser context, define a dedicated typed fixture under `fixtures/` to provide that context's PageObjects and dispose any context it creates. Tests may still use browser/context APIs for their browser-behavior assertions.

`fixtures/browserContexts.ts` supplies the architecture suite's `isolatedLoginPage`, `isolatedInventoryPage`, and `sharedInventoryPage` fixtures, exposed through `fixtures/pages.ts`. Its isolated context inherits the configured `baseURL`; its extra context and shared-context tab are disposed in fixture teardown. `cartItems` in `fixtures/pages.ts` supplies a fresh recorded-product list per test. Neither browser/PageObject fixtures nor test-data fixture definitions belong under `tests/`.

For example, the inventory fixture is defined in `fixtures/pages.ts` like this (alongside the other page registrations):

```ts
import { test as loginTest, expect } from "./login";
import { InventoryPage } from "../page-object/inventoryPage";

type PageFixtures = { inventoryPage: InventoryPage };

export const test = loginTest.extend<PageFixtures>({
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

export { expect };
```

### Test consumption and adoption

- Import `test` and `expect` from `fixtures/pages.ts`, using the correct relative path for the spec's folder. For example, `tests/order.spec.ts` uses `../fixtures/pages`; a spec in `tests/cancel-order/` uses `../../fixtures/pages`.
- Request the PageObjects needed by each test or hook through its fixture arguments, such as `async ({ cartPage, checkoutInformationPage }) => { ... }`. Do not import PageObject classes into specs or use `new` to construct them there.
- Apply this requirement to new tests and future refactors. Migration of existing tests is deferred until explicitly requested; updating these guidelines does not authorize a bulk test refactor.

Example using the project's fixtures:

```ts
import { test, expect } from "../fixtures/pages";

test.beforeEach(async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login("standard_user", "secret_sauce");
  await inventoryPage.addItemToCart("Sauce Labs Backpack");
  await inventoryPage.goToCart();
});

test.afterEach(async ({ cartPage }) => {
  await cartPage.goto();
  await cartPage.clear();
});

test("cancel checkout and preserve the selected item", async ({
  cartPage, checkoutInformationPage,
}) => {
  await cartPage.goToCheckout();
  await checkoutInformationPage.cancel();
  await expect(cartPage.itemName("Sauce Labs Backpack")).toHaveText("Sauce Labs Backpack");
});
```

## MCP and CLI generation/healing

- Explore the live interface and keep plans in `specs/testing/`. Separate observed behavior from proposed requirements.
- Read this context file, existing PageObjects, and the registrations under `fixtures/` before generating code, regardless of whether the browser is controlled through MCP or CLI. Add any missing PageObject fixture under `fixtures/` and expose it through `fixtures/pages.ts`; generated specs must request the fixture rather than construct the class.
- Browser exploration can use the tools' raw click/fill/snapshot commands. Generated tool output is input to implementation: put selectors/actions in the owning PageObject and write specs using that API before saving the final tests.
- Reuse PageObjects during healing. If a selector changes, update its owning class and rerun affected consumers. If behavior differs from an agreed requirement, report the discrepancy rather than silently changing the requirement.
- Migrate relevant legacy page interactions when refactoring a test. Existing raw tests are not examples to copy into new code; migrating untouched suites is separate work.

## Review and verification

Before considering a new/refactored test complete, check that page classes live in the documented location, each file contains only one PageObject class, every PageObject has a typed fixture under `fixtures/`, specs/hooks obtain instances through fixture arguments, and no PageObjects are constructed in specs or support helpers. Also check that selectors are encapsulated, hooks/data remain isolated, and scenario expectations remain visible.

Run the affected Chromium specs with retries disabled, for example:

```bash
npx playwright test tests/order.spec.ts tests/product-details.spec.ts --project=chromium --retries=0
```

Also run affected existing consumers when changing a shared PageObject or fixture. Record what passed and any unresolved failure. Keep the README, route map, and agent instructions consistent with this context file.
