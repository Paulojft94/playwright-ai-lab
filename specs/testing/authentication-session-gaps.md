# Authentication and session coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

`tests/login.spec.ts` and `tests/loginParameterized.spec.ts` cover successful login, invalid credentials, missing credentials and locked accounts. `tests/architecture.spec.ts` covers context isolation, shared authentication between tabs and unauthorized inventory access. They do not exercise logout or recovery after dismissing an error.

CLI exploration confirmed invalid credentials show an error; Dismiss error hides it while retaining both entered values. Correcting the values permits login. Logout returned to `/`; browser Back was redirected to login with the inventory access error. Direct logged-out cart and checkout-information URLs also returned to login with route-specific errors. Logging into the same standard account restored the previously selected Backpack. Cart retention is observed behavior, not an approved cross-account privacy policy.

## Scenarios

### AUTH-01 — Dismiss and recover from a login error (P1)

1. Start logged out. Submit `invalid_user` / `invalid_password`; expect the credential error and login route.
2. Click Dismiss error; expect no visible error, both values retained, and a usable Login button.
3. Submit unchanged invalid values; expect the error again. This repeat step is a proposed extension, not executed during this exploration.
4. Replace both fields with valid standard credentials and submit; expect `/inventory.html` and Products, with no login error.

### AUTH-02 — Logout revokes protected navigation (P0)

1. Login, add Backpack and verify badge 1. Open Menu and Logout; expect `/` and the login form.
2. Use browser Back; expect login rather than a usable Products page and the inventory access error.
3. In independent variants, navigate to `/cart.html` and `/checkout-step-one.html` while logged out; expect login and an access error identifying the requested route. Neither page may expose an actionable authenticated checkout.
4. Submit valid credentials; expect Products and usable navigation.

### AUTH-03 — Characterize cart retention across same-account relogin (P2, policy review)

1. Login, add Backpack, verify its cart row and logout.
2. Login again in the same browser context as the same account.
3. Current observed baseline: badge 1, Backpack shows Remove, and its cart row is retained. Verify all three representations agree.
4. Obtain acceptance for retention before making it a permanent requirement. Cross-account cart isolation needs a separate policy and exploration; this probe does not establish it.

## PageObject handoff

Reuse `loginPage`, `inventoryPage`, and `cartPage`. Add error-dismiss actions/locators to `LoginPage`. Put menu/logout interactions in the owning PageObject or a shared menu component, with one class per file. Browser history/context checks may use Playwright's browser APIs; route/form assertions use injected PageObjects.

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. This document plans future tests; it does not claim they have run.
