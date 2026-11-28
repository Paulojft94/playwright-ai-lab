# Checkout validation and recovery coverage gaps

Audit/exploration: 27 November 2026. See [coverage audit](coverage-gap-audit.md).

## Coverage and observed behavior

The cancellation suite submits all fields blank, checks First Name is required, then cancels. Happy-path specs fill all fields. They do not assert missing Last Name/Postal Code, error dismissal, or correction and continuation. These gaps overlap unimplemented ORD-07/08 in [order.md](order.md); use these scenarios to refine those cases rather than generate duplicate specs.

CLI exploration with Backpack and Bike Light: First Name Ana with Last Name/Postal Code blank produced Last Name is required. Dismiss error removed the message and retained Ana; resubmitting reproduced the error. Adding Silva with Postal Code still blank produced Postal Code is required; adding `1000-001` continued to overview with both items intact. Whitespace-only and malformed-postal acceptance was not investigated in this audit.

## Scenarios

### VALID-01 — Required fields block checkout independently (P0)

1. In a fresh context per variant, login, add Backpack and verify its cart row; enter checkout information.
2. Fill valid values Ana / Silva / `1000-001`, except leave one field blank: First Name, Last Name, or Postal Code.
3. Continue; expect the corresponding exact required-field error, information URL/title, and badge 1. No overview or completed order may appear.
4. Expect other populated fields retained. Open Cart through the page UI and verify Backpack still exists at `$29.99`.
5. Independent omission variants remain to verify; the observed Last Name probe also had Postal Code blank. This plan deliberately isolates each validation condition.

### VALID-02 — Dismissal does not bypass validation (P1)

1. Login; add Backpack and Bike Light and verify both rows before checkout.
2. Fill only Ana and Continue; expect Last Name is required.
3. Dismiss error; expect message absent, Ana retained, remaining fields empty and badge 2.
4. Continue unchanged; expect Last Name is required again and no navigation.

### VALID-03 — Correct errors and preserve the order (P0)

1. Login; add Backpack and Bike Light; verify both rows before checkout.
2. Fill only Ana and submit; expect Last Name is required. Fill Silva and submit; expect Postal Code is required.
3. Fill `1000-001` and submit; expect Checkout: Overview and both products, quantity 1 each.
4. Expect subtotal `$39.98`, tax `$3.20`, total `$43.18`, with total equal to subtotal plus tax. There must be no leftover validation message.
5. Finish; expect completion and empty badge. Finish after this recovery path was observed during exploration.

## PageObject handoff

Reuse `checkoutInformationPage`, `checkoutOverviewPage`, `checkoutCompletePage`, `inventoryPage` and `cartPage`. Add error-dismiss action/locator to `CheckoutInformationPage`; use its exposed field locators to assert retained values. Use independent fixtures/hooks for each omission variant. Future acceptance of whitespace or unusual postal formats requires a policy decision; see ORD-15/16 rather than invent validation requirements here.

## Implementation and isolation

Follow [project automation patterns](../engineering/Test-automation-patterns.md). Each scenario and parameter variant starts in a fresh browser context. Use `beforeEach` for login/setup and `afterEach` to remove remaining cart data through `cartPage`, then dispose the context; logged-out scenarios must authenticate for cleanup if needed. Use `standard_user` / `secret_sauce` at https://www.saucedemo.com/. Verify the starting page and cart before the scenario. Never depend on another test's state.

Persisted tests must import typed PageObject fixtures from `fixtures/pages.ts`. Keep page interactions/selectors in the owning class under `page-object/`, one class per file. Add any missing typed, test-scoped fixture under `fixtures/` and expose it through `fixtures/pages.ts`. Use waiting assertions, no fixed sleeps. Retain explicit business assertions in each test. The original audit observations above are historical; the generated specs are mapped below.

## Generated automation

Implemented using the Playwright CLI skill on 28 November 2026. Each scenario has its own spec file; parameter variants remain independent tests/contexts. Shared setup and cleanup hooks use injected PageObjects.

| Scenario | Spec |
| --- | --- |
| VALID-01 | [required-fields.spec.ts](../../tests/coverage-gaps/checkout/required-fields.spec.ts) |
| VALID-02 | [dismissal-does-not-bypass-validation.spec.ts](../../tests/coverage-gaps/checkout/dismissal-does-not-bypass-validation.spec.ts) |
| VALID-03 | [recover-and-complete.spec.ts](../../tests/coverage-gaps/checkout/recover-and-complete.spec.ts) |
