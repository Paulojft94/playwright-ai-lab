# Sauce Demo — Cart and Checkout Cancellation Test Plan

## Application overview

Cancel a pending purchase on <https://www.saucedemo.com/> before submitting it. The cart has **Remove**, **Continue Shopping**, and **Checkout**, but no Cancel button. Removing all selected products clears the pending cart. Checkout's **Cancel** controls abandon checkout while preserving the selected products; they do not clear the cart.

This plan covers these distinct behaviors. Cancellation of an already completed order, refunds, payment reversals, and backend order persistence are outside scope.

## Exploration and evidence

Explored on **27 November 2026**, using the project's **Playwright CLI skill**, CLI **0.1.25**, and visible Google Chrome. Browser interaction used CLI open, fill, click, snapshot, and reload commands. No Playwright MCP, existing test specs, or generated test scripts were used.

Confirmed through live CLI snapshots:

| Action | Observed result |
| --- | --- |
| Add Backpack and open cart | `/cart.html`, `Your Cart`, one Backpack, quantity `1`, price `$29.99`, cart badge `1`. |
| Remove the only Backpack | Remains on Your Cart; product row disappears and cart becomes `Cart, empty`. Continue Shopping and Checkout remain visible. |
| Continue Shopping after removal | Returns to `/inventory.html`, titled `Products`. Backpack can be added again; it was successfully re-added during exploration. |
| Checkout, enter only First Name `Ana`, then Cancel | Returns to `/cart.html`; Backpack, quantity `1`, price `$29.99`, and badge `1` remain. |
| Restart checkout and continue with valid details | Reaches `/checkout-step-two.html`, titled `Checkout: Overview`; Backpack subtotal `$29.99`, tax `$2.40`, total `$32.39`. |
| Cancel from overview | Returns to Products; badge stays `1` and Backpack shows Remove. Reopening the cart confirms the original Backpack remains. |
| Remove the retained Backpack, then reload cart | Remains on Your Cart with no products and an empty cart. |

Local exploration snapshots are in `.playwright-cli/`, including `cancel-plan-inventory.yml`, `cancel-plan-overview-cancelled.yml`, and `cancel-plan-preserved-cart.yml`. These are local session artifacts and may be cleaned; the observations above preserve the planning evidence.

## Mandatory setup for every scenario

Start **each scenario and each variant in a fresh isolated browser session**. Do not depend on another scenario's cart, login, or navigation history.

1. Open Sauce Demo and sign in using its public demo credentials: `standard_user` / `secret_sauce`.
2. Verify `/inventory.html`, title `Products`, and an empty cart.
3. Add **Sauce Labs Backpack** using its own Add to cart button. Record its name and displayed price; the exploration baseline is `$29.99`.
4. Verify badge `1` and the Backpack's Remove action.
5. Open the cart and verify `/cart.html`, `Your Cart`, exactly one Backpack row, quantity `1`, and the recorded price.

**An item must be visibly present before every removal or checkout-cancellation attempt.** For scenarios with two products, also add **Sauce Labs Bike Light** before opening the cart and verify both rows and badge `2`; its observed catalog price is `$9.99`.

Use `Ana` / `Silva` / `1000-001` when complete customer details are needed. No scenario should click Finish: the purpose is to abandon a pending purchase.

## Test scenarios

### 1. Clear or edit the pending cart

#### CART-CANCEL-01 — remove-the-only-item-from-cart

**Priority:** P0. **Basis:** Observed baseline. **Setup:** complete the mandatory single-item setup above.

1. Click Remove within the Backpack row.
   - expect: Backpack row disappears; no product rows remain.
   - expect: the numeric cart badge disappears and the cart control indicates an empty cart.
   - expect: the page stays at `/cart.html`, titled `Your Cart`.
2. Inspect the page after removal.
   - expect: Continue Shopping and Checkout remain visible.
   - expect: no checkout completion or order-confirmation message is shown.
3. Click Continue Shopping.
   - expect: `/inventory.html`, title `Products`, and an empty cart.
   - expect: Backpack offers Add to cart again.

**Failure conditions:** item remains, stale numeric badge, unexpected checkout/completion, or Backpack cannot be added again.

#### CART-CANCEL-02 — remove-one-item-without-removing-another

**Priority:** P1. **Basis:** Planned extension; two-item removal was not explored in this session. **Setup:** mandatory setup with Backpack and Bike Light, badge `2`.

1. Click Remove specifically within the Backpack row.
   - expect: only Bike Light remains, quantity `1`, with its recorded price; badge changes to `1`.
   - expect: Backpack is absent and the page remains Your Cart.
2. Click Continue Shopping, then reopen the cart.
   - expect: only Bike Light remains; Backpack has not reappeared.
3. Remove Bike Light.
   - expect: no product rows, no numeric badge, and an empty cart.

**Failure conditions:** wrong product removed, both products removed by one click, duplicate/stale rows, changed remaining price, or incorrect badge.

#### CART-CANCEL-03 — keep-a-removed-item-absent-after-reload

**Priority:** P1. **Basis:** Observed empty-cart reload; catalog follow-up is a planned extension. **Setup:** mandatory single-item setup.

1. Remove Backpack and confirm the cart is empty.
2. Reload the cart in the same authenticated browser session.
   - expect: `/cart.html`, `Your Cart`, no product rows, no numeric badge, and an empty cart.
3. Click Continue Shopping and reopen the cart.
   - expect: the removed item remains absent; navigation does not restore it.

**Failure conditions:** removed product or badge returns, navigation repopulates the cart, or the user is unexpectedly logged out.

#### CART-CANCEL-04 — re-add-an-item-after-clearing-the-cart

**Priority:** P1. **Basis:** Observed removal, catalog return, and successful re-addition; final cart checks extend the baseline. **Setup:** mandatory single-item setup.

1. Remove Backpack and confirm an empty cart.
2. Click Continue Shopping and add Backpack once.
   - expect: its action changes to Remove; badge becomes `1`.
3. Open the cart.
   - expect: exactly one Backpack row, quantity `1`, and the recorded price.

**Failure conditions:** re-addition is blocked, creates duplicate rows, restores an incorrect quantity, or changes the price unexpectedly.

### 2. Abandon checkout while preserving the cart

#### CART-CANCEL-05 — cancel-checkout-from-customer-information

**Priority:** P0. **Basis:** Partial-information cancellation observed; other variants are planned extensions. **Setup:** mandatory single-item setup, repeated independently for each variant.

1. Click Checkout.
   - expect: `/checkout-step-one.html`, title `Checkout: Your Information`, badge `1`.
2. Prepare one variant:
   - leave all customer fields blank;
   - enter First Name `Ana` only (**observed variant**);
   - enter all valid customer details without clicking Continue.
3. Click Cancel.
   - expect: `/cart.html`, title `Your Cart`.
   - expect: exactly the original Backpack, quantity `1`, recorded price, and badge `1`.
   - expect: no order confirmation appears; cancellation is not blocked by incomplete fields.

**Failure conditions:** Cancel submits or completes checkout, shows blocking validation instead of navigating, returns to an unexpected page, or loses/duplicates cart products. Input retention after re-entering checkout is not an established requirement.

#### CART-CANCEL-06 — cancel-after-a-customer-information-validation-error

**Priority:** P1. **Basis:** Planned extension; validation followed by Cancel was not explored. **Setup:** mandatory single-item setup.

1. Click Checkout and Continue with all customer fields empty.
   - expect: `Error: First Name is required`, remaining on the information page.
2. Click Cancel while the error is visible.
   - expect: Your Cart is displayed with the original Backpack, quantity `1`, recorded price, and badge `1`.
   - expect: the previous validation error does not block navigation or appear on the cart.

**Failure conditions:** validation traps the user, Cancel triggers another submit, the error leaks into the cart, or cart selection changes.

#### CART-CANCEL-07 — cancel-checkout-from-order-overview

**Priority:** P0. **Basis:** Observed baseline for one item; two-item variant is a planned extension. **Setup:** mandatory single-item setup, or an independent two-item setup for the variant.

1. Click Checkout, enter valid customer details, and Continue.
   - expect: `/checkout-step-two.html`, title `Checkout: Overview`, and the selected products with their original quantities and prices.
   - expect: for Backpack alone, subtotal `$29.99`, tax `$2.40`, total `$32.39`.
2. Click Cancel rather than Finish.
   - expect: `/inventory.html`, title `Products`.
   - expect: the badge still reflects the selected item count, and selected products offer Remove.
   - expect: no order confirmation or dispatch message appears.
3. Reopen the cart.
   - expect: exactly the original products, quantities, prices, and badge count remain.

**Failure conditions:** cancellation clears or duplicates the cart, completes the order, returns to the wrong stage, or alters product details.

#### CART-CANCEL-08 — clear-the-cart-after-abandoning-checkout

**Priority:** P1. **Basis:** Observed after overview cancellation; information-page variant is a planned extension. **Setup:** mandatory single-item setup, repeated independently per variant.

1. Abandon checkout through one of these routes:
   - Checkout → enter First Name `Ana` → Cancel → Your Cart;
   - Checkout → enter valid details → Continue → Cancel → Products → open cart (**observed variant**).
   - expect: Backpack is still in the cart before the next action.
2. Click Remove within the Backpack row.
   - expect: no product rows, no numeric badge, and an empty cart on Your Cart.
3. Reload the cart.
   - expect: the cart remains empty and no completion message is displayed.

**Failure conditions:** retained item cannot be removed, reappears after reload, or cancellation unexpectedly creates a completed order.

## Execution and handoff

- Every scenario starts with the mandatory populated-cart setup. Empty-cart startup alone is not sufficient cancellation coverage.
- Observed baseline means the listed core behavior was explored through the CLI; planned extensions and variants still need execution. This document is a plan, not a report that every scenario passed.
- Pass only when every stated expectation is met. Capture the destination URL, visible title, item rows/prices, and badge before and after cancellation; on failure, capture the actual error and relevant snapshot.
- Scope Remove to its product row when there are multiple products. Use accessible button/textbox names and verified attributes; do not preserve temporary snapshot refs as automation locators.
- Start each scenario in a fresh session; same-session reload/navigation checks stay within that scenario. Never chain scenarios or reuse their cart state.
- Do not infer a confirmation dialog or dedicated cart Cancel button: neither was observed. Continue Shopping is navigation, not cart cancellation when items remain.
- Do not assert that empty-cart Checkout is disabled or that Cancel clears the cart; those are not the observed contract. Agree any stricter business requirement separately.
- No checkout was finished during this exploration. Nothing here proves a backend order, charge, or shipment was created or cancelled.
- No test code or project test configuration is created or changed by this planning task.

## Generated automated coverage

The subsequent CLI-based generation task implemented the plan in `tests/cancel-order/`, with one independent test per spec file. All 12 tests passed in Chromium on 27 November 2026, with retries disabled, including their setup and cleanup hooks.

| Scenario | Spec file(s) in `tests/cancel-order/` |
| --- | --- |
| CART-CANCEL-01 | `remove-the-only-item-from-cart.spec.ts` |
| CART-CANCEL-02 | `remove-one-item-without-removing-another.spec.ts` |
| CART-CANCEL-03 | `keep-a-removed-item-absent-after-reload.spec.ts` |
| CART-CANCEL-04 | `re-add-an-item-after-clearing-the-cart.spec.ts` |
| CART-CANCEL-05 | `cancel-checkout-from-customer-information-blank-fields.spec.ts`, `cancel-checkout-from-customer-information-partial-details.spec.ts`, `cancel-checkout-from-customer-information-complete-details.spec.ts` |
| CART-CANCEL-06 | `cancel-after-a-customer-information-validation-error.spec.ts` |
| CART-CANCEL-07 | `cancel-checkout-from-order-overview-single-item.spec.ts`, `cancel-checkout-from-order-overview-two-items.spec.ts` |
| CART-CANCEL-08 | `clear-the-cart-after-abandoning-checkout-customer-information.spec.ts`, `clear-the-cart-after-abandoning-checkout-order-overview.spec.ts` |

Each spec imports the shared `test` and `expect` from `fixtures/pages.ts` and registers the hooks in `support.ts`. The hooks and workflow helpers receive PageObjects through fixtures. `beforeEach` logs in with a fresh browser context, records the selected products' displayed names/prices, adds them, and verifies the populated cart before the test. `afterEach` uses `CartPage` to return to the cart, remove remaining items through the UI, and verify the empty cart; Playwright's context teardown disposes authentication and browser storage. Product expectations live in `test-data/products.ts`; the recorded item list is scoped to each test through the `cartItems` fixture, so parallel runs do not share cart data.

Run this coverage with:

```bash
npx playwright test tests/cancel-order --project=chromium --retries=0
```

The pass result above validates the generated variants, including those originally marked as planned extensions. It does not establish any backend cancellation or payment behavior outside this plan.
