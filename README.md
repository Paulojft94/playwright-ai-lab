# Playwright AI Lab

This project is a space for learning and experimenting with Playwright, TypeScript, and AI-assisted testing against Sauce Demo. The experiments cover browser architecture and session isolation, login scenarios, reusable Page Objects, custom fixtures, test data, checkout, and cancellation. The AI work explores browser interaction, test planning, test generation, and failure investigation through both Playwright MCP agents and Playwright CLI skills.

## Engineering rules

[Test-automation-patterns.md](specs/engineering/Test-automation-patterns.md) is the project-wide context for test automation. Read it before planning, generating, implementing, refactoring, or healing tests. [AGENTS.md](AGENTS.md), the Copilot instructions, the MCP agent roles, and the CLI skill all reference it.

**New and refactored Playwright tests must use PageObjects**, with one page-specific class per file under `page-object/`, following [Playwright's POM guidance](https://playwright.dev/docs/pom). Scenario assertions stay visible in the tests; selectors and UI interactions belong to the owning PageObject, including when used from hooks or support helpers.

## AI-assisted testing: plan, generate, run, heal

The workflow starts with exploring the live application, records observable behavior in a Markdown plan, turns its scenarios into tests, and runs those tests. When a test fails, inspect the actual page and failure evidence, identify the cause, correct the test when appropriate, and rerun it. An application defect or an unclear requirement needs investigation; changing an assertion just to obtain a passing test is not a fix.

A **skill** supplies instructions and examples for an AI agent. **MCP** exposes callable tools to the agent. **Playwright CLI** exposes browser commands through the terminal. Both approaches can explore a live browser and support the same testing workflow; installing a skill supplies guidance, while the configured tools or executable perform the actions.

| Stage | Playwright MCP approach | Playwright CLI approach |
| --- | --- | --- |
| Explore | Browser tools provide snapshots and interactions. | `open`, `snapshot`, `fill`, and `click` drive a browser session. |
| Plan | Planner sets up the seed page and explores the user journey. | Agent follows the CLI skill, explores the journey, and saves the plan. |
| Generate | Generator replays steps and verifications, reads its log, and writes a spec. | Agent replays steps through CLI commands and builds specs from the actions and expected results. |
| Run | Test-runner tools execute the selected specs. | `npx playwright test` executes the selected specs. |
| Heal | Healer instructions guide investigation using test-debugging and browser tools. | Agent uses CLI snapshots and interactions alongside test errors/traces, applies a justified fix, and reruns the failing test. |

### Playwright MCP and the test agents

The existing [.vscode/mcp.json](.vscode/mcp.json) configures the `playwright-test` server with:

```bash
npx playwright run-test-mcp-server
```

An MCP-capable agent client launches this server and exposes its tools. The project keeps instructions for three roles:

- [Planner](<.github/chatmodes/ 🎭 planner.chatmode.md>): calls `planner_setup_page`, explores the interface, and writes independent scenarios with setup, steps, and expected results.
- [Generator](.github/chatmodes/🎭 generator.chatmode.md): calls `generator_setup_page`, executes scenario steps and verifications through browser tools, reads `generator_read_log`, and saves the spec through `generator_write_test`.
- [Healer](.github/chatmodes/🎭 healer.chatmode.md): investigates failed runs, inspects the page, fixes the underlying test issue, and verifies the result. Do not hide failures by skipping tests or weakening assertions without an agreed reason.

[tests/seed.spec.ts](tests/seed.spec.ts) provides the authenticated starting point for the MCP planning and generation sessions: it logs in and verifies Products. Each automated scenario must still establish its own isolated starting state.

Example requests used for this workflow:

```text
Use the Playwright Planner Agent and Playwright MCP to explore placing an
order on Sauce Demo. Save the plan to specs/testing/order.md.

Use Playwright MCP to execute ORD-01 as an exploratory test in a visible
external browser. Report passed and failed expectations; do not generate code.

Use Playwright Generator to implement ORD-01 from specs/testing/order.md,
then run the resulting spec.
```

The exploratory execution and code generation are separate tasks: a successful browser walkthrough does not prove that a generated test runs successfully. Run the saved spec independently.

### Playwright CLI and skills

The project stores its CLI instructions in [SKILL.md](.github/.agents/skills/playwright-cli/SKILL.md), with a [plan/generate/heal reference](.github/.agents/skills/playwright-cli/references/test-generation.md). Point the agent at these instructions when requesting CLI work. The installed CLI can drive the browser without using MCP.

Install the global executable, then initialize the workspace:

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
playwright-cli install
```

The global npm install installs the executable; `playwright-cli install` initializes the workspace. Custom CLI settings belong in `.playwright/cli.config.json`, which is separate from the test runner's `playwright.config.ts`.

The configuration used on this lab's macOS 13 machine selects the already installed Google Chrome and shows its external browser window:

```json
{
  "browser": {
    "browserName": "chromium",
    "launchOptions": {
      "channel": "chrome",
      "headless": false
    }
  }
}
```

With CLI 0.1.25, automatic initialization attempted an unsupported FFmpeg download on macOS 13. Selecting the installed Chrome explicitly allowed initialization and browser interaction to work. This does not establish support for video recording or all features of the newer bundled Playwright.

A direct CLI exploration session looks like this:

```bash
playwright-cli -s=explore open https://www.saucedemo.com/ --headed
playwright-cli -s=explore snapshot
# Read the snapshot, then use its current element refs:
# playwright-cli -s=explore fill <username-ref> standard_user
# playwright-cli -s=explore fill <password-ref> secret_sauce
# playwright-cli -s=explore click <login-ref>
playwright-cli -s=explore snapshot
playwright-cli -s=explore close
```

Snapshot refs change as the page changes. Use current refs for exploration and stable, verified locators in saved tests. CLI commands print equivalent Playwright actions; a complete test also needs assertions for each expected result.

Example requests:

```text
Use Playwright CLI with skills to log into Sauce Demo. Do not use MCP or
existing test specs, and do not generate scripts. Report whether login succeeded.

Use Playwright CLI with skills to explore cart cancellation. Add an item
before cancelling and save the plan to specs/testing/cancel-order.md.

Generate tests from cancel-order.md using the CLI skill. Use beforeEach
for populated-cart setup and afterEach for cleanup. Run the tests and
investigate and heal any failures.
```

This project is locked to Playwright **1.56.1**. Its test runner does not offer the newer CLI debug-attachment workflow documented in the skill (`--debug=cli` and CLI attach). For these exercises, browser walkthroughs used direct CLI sessions; generated specs ran with the project's existing `npx playwright test`. The global CLI and the project's test runner have separate versions.

### Artifacts and results from the exercises

| Exercise | Artifact / result |
| --- | --- |
| MCP order planning | [order.md](specs/testing/order.md): 16 scenarios, with live observations distinguished from proposed checks. |
| MCP exploratory order execution | ORD-01 completed in visible Chromium; item, quantity, totals, confirmation, and empty-cart expectations passed. |
| MCP order generation | [place-a-single-product-order.spec.ts](tests/place-a-single-product-order.spec.ts), subsequently split into eight independent tests. |
| CLI-only login | Reached `/inventory.html` and Products using the public demo credentials. |
| CLI cancellation planning | [cancel-order.md](specs/testing/cancel-order.md): eight scenarios covering cart removal and abandoning checkout. |
| CLI cancellation generation | [tests/cancel-order](tests/cancel-order/): 12 tests including all variants, with setup and cleanup registered through [support.ts](tests/cancel-order/support.ts). All 12 passed in Chromium with retries disabled in the recorded run. |
| Failure correction | [order.spec.ts](tests/order.spec.ts) expected the previous page's title after Checkout and Continue. Correcting both destination titles produced a passing run. The cancellation suite required no healing. |

Cancellation setup adds and verifies the required products in `beforeEach`. Cleanup removes remaining products through the UI in `afterEach`; Playwright disposes the test's isolated browser context. Each scenario can run independently, including in parallel.

Run the generated coverage with:

```bash
npx playwright test tests/place-a-single-product-order.spec.ts --project=chromium
npx playwright test tests/cancel-order --project=chromium --retries=0
```

Recorded results describe those executions against the live demo; rerun the specs to verify the current site. Sauce Demo accepts some inputs that a production shop might reject, so plans explicitly separate observed behavior from proposed business requirements.

## Architecture explored

In Playwright, a **browser** represents the browser instance started by a test. A browser can contain multiple independent **browser contexts**. Each context behaves like an isolated session with its own state, such as cookies. A context can contain one or more **pages** (tabs). Pages in the same context share that context's state; pages in different contexts do not.

`tests/architecture.spec.ts` contains three active experiments:

- Log in on one page, then open the inventory in a separate browser context and check that the second session cannot access it without logging in.
- Open a second page in the same context, verify it shares authentication, and assert that a cookie added through the first page is visible through the second. A fixture closes the additional tab.
- Add different values for the same cookie in two separate contexts and assert each context retains its own value. Close the additional context and assert that only one context remains; fixture teardown also ensures cleanup on failure.

## Login and test data experiments

`tests/login.spec.ts` checks the landing page title, successful login, and invalid credentials. It also explores TypeScript utility types:

- `Partial<TestUser>` lets `createUser()` build a user from defaults with selected overrides, such as a wrong password.
- `Pick<typeof usersData, "username" | "password">` defines a credentials-only type from the shared data object.

`test-data/users.ts` holds the shared credentials, the user factory, and its `TestUser` type.

`tests/loginParameterized.spec.ts` generates one test per entry in a table of login scenarios using `forEach`. It checks the exact error messages for a missing password, a missing username, a locked-out user, and invalid credentials.

## Page Objects and fixtures

The application pages have separate typed PageObject classes:

- `LoginPage` fills the credentials and submits the login form.
- `InventoryPage` finds a product by name, adds it to the cart, and opens the cart.
- `ProductDetailsPage` handles a selected product's details, cart actions, and return to Products.
- `CartPage` handles cart contents, removal, cleanup, Continue Shopping, and starting checkout.
- `CheckoutInformationPage` fills customer information and continues or cancels checkout.
- `CheckoutOverviewPage` exposes selected products and totals, and finishes or cancels checkout.
- `CheckoutCompletePage` exposes confirmation and receipt controls, downloads the PDF, and returns home.

These classes use Playwright's `Page` and `Locator` types, `getByTestId`, and role-based locators. Assertions remain in the test files so each scenario states its expected outcome.

All specs import `test` and `expect` from [fixtures/pages.ts](fixtures/pages.ts), which composes the login fixture, page fixtures, and test-scoped cart data. [fixtures/browserContexts.ts](fixtures/browserContexts.ts) provides additional tabs/contexts and their PageObjects for the architecture tests, with automatic cleanup and an inherited base URL for the isolated context. Tests and workflow helpers use injected PageObjects rather than constructing classes or rebuilding selectors. The [order test](tests/order.spec.ts) exercises checkout; [product-details.spec.ts](tests/product-details.spec.ts) checks the product-details/cart flow.

The full migrated suite passed **37 Chromium tests with retries disabled** in the verification run. Cancellation setup and cleanup still run in `beforeEach` and `afterEach`; product data lives in `test-data/products.ts` and recorded cart data is scoped to each test's fixture.

## Checkout experiment

`tests/order.spec.ts` brings the Page Objects together in a first end-to-end order scenario: log in, add a Sauce Labs Backpack, open the cart, enter customer details, and finish checkout.

The scenario checks `Checkout: Your Information` after starting checkout and `Checkout: Overview` after continuing, then verifies the order confirmation after finishing checkout.

## Project layout

```text
fixtures/
  login.ts                       # Custom loginPage fixture
  pages.ts                       # Typed fixtures for all application PageObjects
  browserContexts.ts             # Extra contexts/tabs and their PageObject fixtures
page-object/
  LoginPage.ts                   # Login interactions (tracked filename case)
  inventoryPage.ts               # Product selection and cart navigation
  productDetailsPage.ts          # Selected product details
  cartPage.ts                    # Cart contents and actions
  checkoutInformationPage.ts     # Checkout customer-information form
  checkoutOverviewPage.ts        # Order review, cancellation, and Finish
  checkoutCompletePage.ts        # Confirmation and receipt
test-data/
  users.ts                       # Shared credentials and typed user factory
  products.ts                    # Product expectations and CartItem type
tests/
  architecture.spec.ts           # Context isolation and shared page state
  login.spec.ts                  # Basic login and TypeScript utility types
  loginParameterized.spec.ts     # Table-driven login error scenarios
  order.spec.ts                  # Checkout flow using page-specific PageObjects
  product-details.spec.ts        # Product-details/cart behavior using PageObjects
  seed.spec.ts                   # Authenticated starting point for agent exploration
  place-a-single-product-order.spec.ts # Generated order checks, split into independent tests
  cancel-order/                  # CLI-generated cancellation specs and shared lifecycle hooks
specs/testing/
  order.md                       # MCP-based order plan
  cancel-order.md                # CLI-based cancellation plan
specs/engineering/
  Test-automation-patterns.md    # Project-wide test automation context
AGENTS.md                       # Engineering rules and context entry point
.vscode/mcp.json                 # Playwright test MCP server configuration
.github/chatmodes/               # Planner, Generator, and Healer instructions
.github/.agents/skills/playwright-cli/ # CLI skill and workflow references
playwright.config.ts
```

## Configuration

`playwright.config.ts` currently enables Chromium with the Desktop Chrome device settings, uses `https://www.saucedemo.com/` as the `baseURL`, and maps test IDs to the `data-test` attribute. Test discovery is limited to `tests/`; PageObjects live under `page-object/` and use `.ts` filenames without the `.spec.ts` test suffix.

Tests run in parallel with the list reporter. In CI, the configuration forbids `test.only`, uses one worker, and retries failures twice. Traces are collected on the first retry; local runs have no retries by default. Use `--reporter=html` when an HTML report is needed.

## GitHub Actions

`playwright-tests.yaml` runs the tests on pushes and pull requests targeting `master`.

To run Chromium tests on demand, add a new comment containing exactly `/test` to an open pull request's conversation. `playwright-pr-comment.yaml` resolves and checks out that PR's current head commit, including changes from forks. Repository owners, organization members, and collaborators can trigger this workflow. Tests run in a separate job with a read-only token and checkout does not persist credentials. Separate jobs publish the commit status and a short result comment without checking out or running PR code.

The comment workflow must first exist on the repository's default branch. Results are available in the Actions tab under **Playwright PR Comment**, with the tested SHA in the run summary and the HTML report in the run's artifacts. To test commits pushed after a run started, post a new `/test` comment.

The workflow publishes **Playwright / Chromium** on the tested PR commit: pending while running, then success or failure. Failures during setup and cancelled test jobs also produce a failing status. A final PR comment includes the result, tested commit, and run link. Requests for the same PR are serialized. If the entire workflow is cancelled before the reporting job can run, the status can remain pending; post `/test` again to rerun it.

To block merging, configure the target branch in **Settings → Rules → Rulesets** (or **Settings → Branches → branch protection**): require status checks before merging and add exactly **Playwright / Chromium** as a required check. Run `/test` once after installing the workflow so GitHub can offer that status in the selector. Enable the rule for the target branch and remove any bypass permissions if it must apply to administrators too. This repository setting cannot be enforced by the workflow YAML alone. Once required, every PR head commit needs a successful `/test` run, including after new pushes; the automatic workflow does not satisfy this separate status.

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

Use UI mode to explore the tests, or generate and view an HTML report:

```bash
npx playwright test --ui
npx playwright test --reporter=html
npx playwright show-report
```

## Tags and annotations

Tags select tests; annotations add report metadata or control execution. See the [Playwright annotations documentation](https://playwright.dev/docs/test-annotations).

### Tagging tests

Pass tags in the second argument of `test()`. Tags must start with `@`:

```ts
test("landing page has title", { tag: "@regression" }, async ({ page }) => {
  await expect(page).toHaveTitle("Swag Labs");
});
```

Writing `tag: "@regression";` inside the callback creates a JavaScript label, so Playwright will not register a tag.

Use `tag: ["@regression", "@smoke"]` for multiple tags. Tag a whole group with `test.describe("Login", { tag: "@regression" }, () => { /* tests */ });`.

```bash
# Run tagged tests
npx playwright test --grep @regression

# List without executing
npx playwright test --list
npx playwright test --grep @regression --list

# Exclude a tag, or match either tag
npx playwright test --grep-invert @regression
npx playwright test --grep "@regression|@smoke"
```

These examples require adding tags to the tests first. No matching titles or tags results in `No tests found`.

### Built-in annotations

| API | Behavior |
| --- | --- |
| `test.skip()` | Skips an inapplicable test. |
| `test.fixme()` | Skips a test awaiting a fix. |
| `test.fail()` | Expects failure; an unexpected pass fails the run. |
| `test.slow()` | Triples the test timeout. |
| `test.only()` | Focuses execution; this project's CI rejects it through `forbidOnly`. |

### Custom annotations

Add context to the HTML report:

```ts
test("landing page has title", {
  tag: "@regression",
  annotation: { type: "feature", description: "Login page title" },
}, async ({ page }) => {
  await expect(page).toHaveTitle("Swag Labs");
});
```

Use tags for `--grep` filtering; custom annotations supply report context.
