# Playwright AI Lab

This project is a space for learning and experimenting with Playwright and TypeScript against Sauce Demo. The experiments cover browser architecture and session isolation, login scenarios, reusable Page Objects, custom fixtures, test data, and a first checkout flow. It is a learning lab whose tests and abstractions evolve as new ideas are explored.

## Architecture explored

In Playwright, a **browser** represents the browser instance started by a test. A browser can contain multiple independent **browser contexts**. Each context behaves like an isolated session with its own state, such as cookies. A context can contain one or more **pages** (tabs). Pages in the same context share that context's state; pages in different contexts do not.

`tests/architecture.spec.ts` contains three active experiments:

- Log in on one page, then open the inventory in a separate browser context and check that the second session cannot access it without logging in.
- Open a second page in the same context and log its cookies before and after adding a cookie through the original page's context, to observe shared state. The second page is closed in a `finally` block.
- Add different values for the same cookie in two separate contexts and log both sets of cookies to observe isolation. Close the second context in a `finally` block and assert that only one context remains.

## Login and test data experiments

`tests/login.spec.ts` checks the landing page title, successful login, and invalid credentials. It also explores TypeScript utility types:

- `Partial<TestUser>` lets `createUser()` build a user from defaults with selected overrides, such as a wrong password.
- `Pick<typeof usersData, "username" | "password">` defines a credentials-only type from the shared data object.

`test-data/users.ts` holds the shared credentials, the user factory, and its `TestUser` type.

`tests/loginParameterized.spec.ts` generates one test per entry in a table of login scenarios using `forEach`. It checks the exact error messages for a missing password, a missing username, a locked-out user, and invalid credentials.

## Page Objects and fixtures

Repeated UI interactions have been moved into typed Page Object classes:

- `LoginPage` fills the credentials and submits the login form.
- `InventoryPage` finds a product by name, adds it to the cart, and opens the cart.
- `CartPage` starts checkout, fills customer information, continues, and finishes the order.

These classes use Playwright's `Page` and `Locator` types, `getByTestId`, and role-based locators. Assertions remain in the test files so each scenario states its expected outcome.

`fixtures/login.ts` extends Playwright's base `test` with a typed `loginPage` fixture and re-exports `expect`. Login, parameterized login, and order tests request this fixture directly; architecture tests instantiate `LoginPage` themselves. The fixture creates the Page Object; navigation and login are still performed by each test.

## Checkout experiment

`tests/order.spec.ts` brings the Page Objects together in a first end-to-end order scenario: log in, add a Sauce Labs Backpack, open the cart, enter customer details, and finish checkout.

This scenario is still being refined: the title assertions immediately after starting checkout and after continuing currently expect the previous screen's title. They need to be aligned with the destination screens before treating the flow as a passing checkout check.

## Project layout

```text
fixtures/
  login.ts                       # Custom loginPage fixture
page-object/
  loginPage.ts                   # Login interactions
  inventoryPage.ts               # Product selection and cart navigation
  cartPage.spec.ts               # CartPage class (despite the .spec.ts suffix)
test-data/
  users.ts                       # Shared credentials and typed user factory
tests/
  architecture.spec.ts           # Context isolation and shared page state
  login.spec.ts                  # Basic login and TypeScript utility types
  loginParameterized.spec.ts     # Table-driven login error scenarios
  order.spec.ts                  # Checkout flow under development
playwright.config.ts
```

## Configuration

`playwright.config.ts` currently enables Chromium with the Desktop Chrome device settings, uses `https://www.saucedemo.com/` as the `baseURL`, and maps test IDs to the `data-test` attribute. Test discovery is limited to `tests/`, so the `CartPage` file outside that directory is a helper rather than a discovered test.

Tests run in parallel with an HTML reporter. In CI, the configuration forbids `test.only`, uses one worker, and retries failures twice. Traces are collected on the first retry; local runs have no retries by default.

## GitHub Actions

`playwright-tests.yaml` runs the tests on pushes and pull requests targeting `main` or `master`.

To run Chromium tests on demand, add a new comment containing exactly `/test` to an open pull request's conversation. `playwright-pr-comment.yaml` resolves and checks out that PR's current head commit, including changes from forks. Repository owners, organization members, and collaborators can trigger this workflow. The token has read-only permissions and checkout does not persist credentials.

The comment workflow must first exist on the repository's default branch. Results are available in the Actions tab under **Playwright PR Comment**, with the tested SHA in the run summary and the HTML report in the run's artifacts. To test commits pushed after a run started, post a new `/test` comment.

## Running the tests

Install the dependencies and Chromium on a fresh checkout:

```bash
npm ci
npx playwright install chromium
```

Run the full suite (requires access to Sauce Demo):

```bash
npx playwright test
```

To run only the architecture tests:

```bash
npx playwright test tests/architecture.spec.ts
```

Run the parameterized login scenarios:

```bash
npx playwright test tests/loginParameterized.spec.ts
```

Use UI mode to explore the tests, or view the HTML report after a run:

```bash
npx playwright test --ui
npx playwright show-report
```
