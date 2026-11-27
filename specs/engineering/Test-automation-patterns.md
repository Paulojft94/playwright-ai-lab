# Project-wide test automation patterns

This is the context file for test automation across this project. Read it before planning, generating, implementing, refactoring, reviewing, or healing Playwright tests. It applies to hand-written tests, MCP agents, and CLI/skill workflows. The repository's engineering instructions link here; maintain the detailed patterns in this file.

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
- Use `fixtures/pages.ts` for test-scoped page instances bound to the test's `page`. `fixtures/login.ts` remains the reusable login fixture used by existing tests.
- Use `beforeEach` for scenario setup and `afterEach` for cleanup when the suite requires test data. Cart cancellation setup must add and verify at least one product before cancellation; cleanup removes any remaining items through `CartPage`.
- Each test gets its own context and required starting state. Do not share mutable PageObjects, a page, or cart data across tests. Hooks must support parallel execution and cleanup after a failure.
- Assert observable outcomes explicitly. Do not hide business expectations inside a generic method that makes the scenario unreadable, remove assertions to obtain a pass, or silently skip failures.

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
- Read this context file and existing PageObjects before generating code, regardless of whether the browser is controlled through MCP or CLI.
- Browser exploration can use the tools' raw click/fill/snapshot commands. Generated tool output is input to implementation: put selectors/actions in the owning PageObject and write specs using that API before saving the final tests.
- Reuse PageObjects during healing. If a selector changes, update its owning class and rerun affected consumers. If behavior differs from an agreed requirement, report the discrepancy rather than silently changing the requirement.
- Migrate relevant legacy page interactions when refactoring a test. Existing raw tests are not examples to copy into new code; migrating untouched suites is separate work.

## Review and verification

Before considering a new/refactored test complete, check that page classes live in the documented location, each file contains only one PageObject class, selectors are encapsulated, hooks/data remain isolated, and scenario expectations remain visible.

Run the affected Chromium specs with retries disabled, for example:

```bash
npx playwright test tests/order.spec.ts tests/page-objects.spec.ts --project=chromium --retries=0
```

Also run affected existing consumers when changing a shared PageObject or fixture. Record what passed and any unresolved failure. Keep the README, route map, and agent instructions consistent with this context file.
