# Sauce Demo — Order Creation End-to-End Test Plan

## Executive summary

This plan covers the shopper journey on <https://www.saucedemo.com/>: select products, review and edit the cart, enter customer information, inspect order totals, finish an order, and download its PDF receipt. It includes validation, cancellation, repeat ordering, and observed edge cases. Sauce Demo is a demonstration storefront: completion is a UI result, not evidence of a real payment, shipment, or persisted backend order.

**Planner:** project Playwright Planner Agent, following `.github/chatmodes/ 🎭 planner.chatmode.md`.

**Exploration:** 27 November 2026, Chromium. The configured Playwright test MCP server (`npx playwright run-test-mcp-server`) was used through an MCP client. `planner_setup_page` ran `tests/seed.spec.ts` before browser interaction. Exploration used MCP `browser_click`, `browser_type`, `browser_fill_form`, `browser_snapshot`, and `browser_navigate` tools. No screenshots were needed. The plan below is based on live accessibility snapshots and interactions, not solely on existing test code.

**Scope:** the standard catalog and `standard_user`. Other demo users, Dynamic Catalog, real payment processing, backend idempotency, and actual delivery are outside this plan. Intentional failure personas can be planned separately.

## Starting state and test data

**Seed:** `tests/seed.spec.ts`, using `fixtures/login.ts`, the existing `LoginPage`, and `test-data/users.ts`.

Every numbered scenario below is independent. Start each scenario and each parameterized variant with a **new isolated browser context**, no cookies/local storage/session state from previous tests, and an empty cart. Execute the seed login with `standard_user` / `secret_sauce`; verify `inventory.html`, the `Products` title, and an empty cart before performing the listed steps. Do not reuse a previous scenario's completed order, cart, or receipt. The current seed logs in but does not clear an already reused context; context isolation is necessary.

Use fictitious checkout data: **First Name:** `Ana`, **Last Name:** `Silva`, **Zip/Postal Code:** `1000-001`, unless a scenario specifies otherwise. This value was accepted during exploration; it is not proof of address verification.

| Catalog product | Observed unit price |
| --- | ---: |
| Sauce Labs Backpack | $29.99 |
| Sauce Labs Bike Light | $9.99 |
| Sauce Labs Bolt T-Shirt | $15.99 |
| Sauce Labs Fleece Jacket | $49.99 |
| Sauce Labs Onesie | $7.99 |
| Test.allTheThings() T-Shirt (Red) | $15.99 |

Capture product names and prices at selection and compare them through the cart and overview. Use decimal currency arithmetic or integer cents. The observed Backpack subtotal/tax/total was **$29.99 / $2.40 / $32.39**; Backpack + Bike Light was **$39.98 / $3.20 / $43.18**. These samples are consistent with tax rounded to cents at 8%, but no tax policy is displayed. Always assert subtotal equals the selected line-price sum and total equals displayed subtotal plus tax. Treat a fixed 8% tax assertion as a documented demo-baseline assumption requiring review if the site changes.

## Confirmed navigation and behavior

| Stage | URL path | Visible title / key content |
| --- | --- | --- |
| Catalog | `/inventory.html` | `Products` |
| Cart | `/cart.html` | `Your Cart` |
| Customer information | `/checkout-step-one.html` | `Checkout: Your Information` |
| Order overview | `/checkout-step-two.html` | `Checkout: Overview` |
| Completion | `/checkout-complete.html` | `Checkout: Complete!`; `Thank you for your order!` |

The document title remains `Swag Labs`; assert the stage's visible title separately. The overview shows `SauceCard #31337`, `Free Pony Express Delivery!`, `Item total`, `Tax`, `Total`, `Cancel`, and `Finish`. No card-entry or shipping-method selection was present.

Observed behavior:

- Adding a product changes its button to `Remove` and increments the cart badge. The cart shows quantity `1` for each selected distinct product.
- Removing the only item clears the row and cart badge. Continue Shopping is present in the cart; its navigation/preservation behavior is a planned check below, not an interaction completed during exploration.
- Customer information validates empty strings in this order: `Error: First Name is required`, `Error: Last Name is required`, `Error: Postal Code is required`.
- Information-step Cancel returns to the cart. Overview Cancel returns to Products. Both observed cancellations preserved the two selected products.
- Finishing a Backpack order shows the completion heading and clears the cart. Back Home returns to Products with the Backpack available to add again.
- Generate PDF order downloaded a file named like `swag-labs-order-2026-11-27_12-14-53.pdf`, leaving the completion screen and empty cart intact. PDF contents and file size were not inspected.
- **Observed demo gaps:** an empty cart can reach overview with zero totals and Finish can complete the empty order. In separate probes on an authenticated, empty-cart checkout, three spaces in every customer field and a postal code of `!!!` were accepted. Do not describe these inputs as rejected by the current application.

## Acceptance and execution rules

For each scenario, **pass** means every stated expected result is satisfied; **fail** means a missing/wrong result, unexpected navigation/error, wrong item or amount, or unintended cart mutation. Capture the tested commit, URL, relevant visible error, and a trace on failure. A failed login/setup is a setup failure, not a checkout assertion failure.

Scenarios marked **Observed baseline** verify behavior directly explored, with any additional assertions identified. Scenarios marked **Planned extension** extend that evidence and must be verified during implementation. Scenarios marked **Characterization / requirement decision** document permissive demo behavior; desired business restrictions must be agreed separately rather than silently turned into passing regression expectations.

## Test scenarios

### ORD-01 — Place a single-product order

**Priority:** P0. **Basis:** Observed baseline. **Start:** fresh context + seed; empty cart.

1. On Products, record the Backpack name and price, then click its Add to cart button.
2. Verify badge `1` and Backpack's Remove button; open the cart.
3. Verify Your Cart, one Backpack row, quantity `1`, and the recorded price.
4. Click Checkout; verify Checkout: Your Information and its URL.
5. Fill Ana / Silva / 1000-001 and click Continue.
6. Verify Checkout: Overview, exactly the same Backpack row/quantity/price, payment/shipping information, and subtotal/tax/total.
7. Click Finish.
8. Verify Checkout: Complete!, `Thank you for your order!`, the dispatch message, Back Home, Generate PDF order, and an empty cart.

**Expected:** the observed price baseline is $29.99 subtotal, $2.40 tax, $32.39 total; no order completion appears before Finish. **Failure conditions:** wrong product, stage/title, totals, missing completion, or nonempty cart after Finish.

### ORD-02 — Review totals and complete a two-product order

**Priority:** P0. **Basis:** multi-item overview observed; multi-item Finish is a planned extension. **Start:** fresh context + seed.

1. Add Backpack and Bike Light, recording both prices.
2. Open the cart and verify badge `2`, exactly two distinct rows, and quantity `1` for each.
3. Proceed to Checkout, enter the standard customer data, and Continue.
4. Verify overview contains both products once, with unchanged prices and quantities.
5. Verify subtotal equals their price sum; verify displayed tax and total arithmetic.
6. Click Finish and verify the completion heading and empty cart.

**Expected:** observed overview baseline $39.98 subtotal, $3.20 tax, $43.18 total. **Failure conditions:** missing/duplicate item, wrong sum/rounding, failed completion, or remaining cart items.

### ORD-03 — Remove one product before checkout

**Priority:** P1. **Basis:** Planned extension of observed Remove behavior. **Start:** fresh context + seed.

1. Add Backpack and Bike Light; open the cart.
2. Remove Backpack using the Remove button within its own row.
3. Verify only Bike Light remains and badge is `1`.
4. Checkout with standard customer data and Continue.
5. Verify overview contains only Bike Light, subtotal equals its recorded price, and total equals subtotal plus displayed tax.
6. Finish and verify completion and empty cart.

**Expected:** removed product contributes neither a row nor a charge. **Failure conditions:** wrong row removed, stale badge, Backpack reappears, or totals still include it.

### ORD-04 — Remove the final cart item

**Priority:** P1. **Basis:** Observed baseline. **Start:** fresh context + seed.

1. Add Backpack and open the cart.
2. Click Remove within the Backpack row.
3. Verify the row disappears and the cart is empty with no numeric badge.
4. Return to Products using Continue Shopping and inspect Backpack's action.

**Expected:** empty cart; Backpack can be added again. The final navigation/button reset check is a planned extension. **Failure conditions:** remaining row/count, stale Remove state after return, or a ghost item on reopening the cart. Empty-cart checkout handling is assessed separately in ORD-14.

### ORD-05 — Continue shopping and preserve the selected cart

**Priority:** P1. **Basis:** Planned extension; control presence observed. **Start:** fresh context + seed.

1. Add Backpack; open the cart.
2. Click Continue Shopping.
3. Verify Products, badge `1`, and Backpack marked Remove.
4. Add Bike Light and reopen the cart.
5. Verify Backpack and Bike Light each appear once, quantity `1`, badge `2`.
6. Checkout, enter standard data, Continue, and verify both products and subtotal arithmetic.

**Expected:** returning to the catalog preserves prior selection and adding another product does not duplicate or replace it. **Failure conditions:** lost/duplicated selection, incorrect badge, or wrong checkout contents.

### ORD-06 — Reject completely empty customer information

**Priority:** P0. **Basis:** Observed baseline. **Start:** fresh context + seed.

1. Add Backpack, open the cart, and click Checkout.
2. Leave First Name, Last Name, and Zip/Postal Code empty.
3. Click Continue.
4. Inspect the visible alert and current page.

**Expected:** exact `Error: First Name is required`; stay on checkout-step-one with Checkout: Your Information and the cart unchanged. **Failure conditions:** reaching overview, missing/wrong alert, or lost cart contents.

### ORD-07 — Validate each required field independently

**Priority:** P0. **Basis:** error wording/precedence observed sequentially; independent variants are planned extensions. **Start:** a separate fresh context + seed for each table row.

1. Add Backpack, open the cart, and click Checkout.
2. Fill the fields according to one row below, leaving only the specified field empty.
3. Click Continue.
4. Verify the exact error, unchanged entered values, current URL, and cart badge.

| First Name | Last Name | Zip/Postal Code | Expected alert |
| --- | --- | --- | --- |
| empty | Silva | 1000-001 | `Error: First Name is required` |
| Ana | empty | 1000-001 | `Error: Last Name is required` |
| Ana | Silva | empty | `Error: Postal Code is required` |

**Expected:** remain on customer information; retained nonempty values and badge `1`. **Failure conditions:** wrong validation target, advancing with an empty required field, or losing unrelated inputs/cart.

### ORD-08 — Recover from validation errors and finish checkout

**Priority:** P1. **Basis:** Observed recovery through overview; final Finish extends it. **Start:** fresh context + seed.

1. Add Backpack, open cart, Checkout, and Continue with all fields empty.
2. Verify the First Name error; fill Ana and Continue.
3. Verify the Last Name error; fill Silva and Continue.
4. Verify the Postal Code error; fill 1000-001 and Continue.
5. Verify overview and correct Backpack totals with no blocking validation error.
6. Click Finish and verify completion.

**Expected:** correcting one field reveals the next required field without clearing previous entries; valid data allows completion. **Failure conditions:** stale blocking error, lost values, wrong validation order, or inability to proceed after correction.

### ORD-09 — Cancel from customer information

**Priority:** P1. **Basis:** Observed navigation/cart preservation; partial-input variant is a planned extension. **Start:** fresh context + seed.

1. Add Backpack and Bike Light; open cart and Checkout.
2. Enter only First Name `Ana`.
3. Click Cancel.
4. Verify cart.html / Your Cart, both original products, their prices/quantities, and badge `2`.
5. Click Checkout again and verify a usable customer-information form.

**Expected:** Cancel does not create an order or clear the cart. Do not assume partial input persists after reentry; establish and document that separately. **Failure conditions:** completion shown, wrong destination, or changed cart selection.

### ORD-10 — Cancel from overview and restart checkout

**Priority:** P1. **Basis:** Observed cancellation target and cart preservation; restart is a planned extension. **Start:** fresh context + seed.

1. Add Backpack and Bike Light, open cart, Checkout, enter standard data, and Continue.
2. Verify both overview rows and totals, then click Cancel.
3. Verify inventory.html / Products, badge `2`, and Remove actions for both products.
4. Reopen cart and verify both products still present.
5. Start checkout again, enter standard data, Continue, and verify unchanged totals.

**Expected:** overview Cancel returns to Products, preserves the cart, and does not complete an order. **Failure conditions:** wrong destination, lost/duplicated products, completion message, or changed totals without cart edits.

### ORD-11 — Complete an order, return home, and place another

**Priority:** P1. **Basis:** completion, Back Home, and empty catalog cart observed; second order is a planned extension. **Start:** fresh context + seed.

1. Add Backpack and complete checkout with standard customer data.
2. Verify completion and empty cart; click Back Home.
3. Verify Products, empty cart, and Backpack Add to cart action.
4. Add only Bike Light; open cart and verify only Bike Light appears.
5. Checkout with standard data, verify the new overview excludes Backpack, then Finish.
6. Verify completion and empty cart again.

**Expected:** the second order starts clean; totals contain only the new product. **Failure conditions:** previous order/cart products or charges leak into the next order.

### ORD-12 — Download the completed order PDF

**Priority:** P1. **Basis:** PDF download observed; file validity/content checks are planned extensions. **Start:** fresh context + seed.

1. Add Backpack and complete a standard checkout, recording the overview names, prices, and totals before Finish.
2. On completion, begin waiting for a download before clicking Generate PDF order.
3. Save the download as a test artifact; inspect its suggested filename and download failure result.
4. Verify the screen remains Checkout: Complete! and cart remains empty.
5. As an extended receipt check, verify a nonempty PDF document and compare its readable contents with the recorded order, once the receipt format is inspected and approved.

**Expected:** a successful download with filename starting `swag-labs-order-` and ending `.pdf`; timestamp is dynamic. Only successful download, naming pattern, and unchanged screen/cart were observed. **Failure conditions:** missing/failed download, wrong format, navigation away, or cart mutation. Receipt-content mismatches become failures only after that extended assertion is established.

### ORD-13 — Preserve an in-progress cart across a page reload

**Priority:** P2. **Basis:** Planned extension, not explored. **Start:** fresh context + seed.

1. Add Backpack and Bike Light; open the cart and record both rows/prices.
2. Reload cart.html in the same authenticated context.
3. Inspect authentication, badge, and cart rows.
4. If the cart persists, complete checkout with standard data and verify the same products and arithmetic.

**Expected requirement:** cart persists once selected during the current session, without duplicates. Confirm this persistence contract before making the scenario a required regression. **Failure conditions against that requirement:** lost/duplicated rows, unexpected logout, or changed selection/totals after reload.

### ORD-14 — Characterize checkout with an empty cart

**Priority:** P1. **Basis:** Observed demo gap / requirement decision. **Start:** fresh context + seed; verify empty cart explicitly.

1. Open the empty cart without adding anything.
2. Click Checkout and enter Ana / Silva / 1000-001.
3. Continue to overview; inspect item rows and totals.
4. Click Finish and inspect the final page.

**Observed baseline:** overview has no product rows, Item total `$0`, Tax `$0.00`, Total `$0.00`; Finish reaches completion and the cart stays empty. A characterization test passes when it reproduces that behavior and fails if it changes. **Proposed business acceptance:** prevent completing an order with no products and present an explanation; the current site would fail that proposed rule. Obtain a product decision before using rejection as a gating expectation.

### ORD-15 — Characterize whitespace-only customer details

**Priority:** P2. **Basis:** Observed permissive validation / requirement decision. **Start:** fresh context + seed; keep cart empty to reproduce the exact probe.

1. Navigate to `/checkout-step-one.html` in the authenticated session.
2. Fill First Name, Last Name, and Zip/Postal Code with exactly three spaces each.
3. Click Continue and inspect URL, title, and any validation alert.
4. Repeat as a separate fresh variant with one Backpack in the cart to establish whether behavior differs for a nonempty order.

**Observed baseline:** the empty-cart probe advanced to Checkout: Overview without required-field errors. Nonempty-cart variant was not explored. **Proposed business acceptance:** trim input and treat whitespace-only values as missing. A characterization passes on the observed empty-cart transition; it fails if behavior changes. The proposed stricter validation is currently an improvement request, not a confirmed contract.

### ORD-16 — Characterize malformed postal-code handling

**Priority:** P2. **Basis:** Observed permissive validation / requirement decision. **Start:** fresh context + seed; empty cart for the confirmed probe.

1. Navigate to `/checkout-step-one.html` while authenticated.
2. Fill First Name `John`, Last Name `Doe`, and Zip/Postal Code `!!!`.
3. Click Continue and inspect URL, title, and validation.
4. In a separate fresh variant, add Backpack before checkout and repeat to establish nonempty-order behavior.

**Observed baseline:** the empty-cart probe accepted `!!!` and reached overview. No geographic or postal-format restriction was established; the nonempty-order variant remains unverified. **Proposed business acceptance:** agree supported formats and length limits before asserting rejection. A characterization passes when the confirmed transition is reproduced and fails if changed; rejecting `!!!` must not be claimed as an existing behavior.

## Automation handoff

- Prioritize ORD-01, ORD-02, ORD-06, ORD-07, and ORD-08, then cart/cancel/reset/PDF coverage. Keep requirement-decision probes separate from mandatory product acceptance tests.
- Reuse the existing login fixture/Page Objects. Scope Add to cart/Remove to the named product or cart row, since several buttons share accessible names. Prefer current `data-test` locators and role/name locators verified through MCP; do not copy transient MCP snapshot refs into tests.
- The live cart control is an accessible button named like `Cart, empty` or `Cart, 2 items`; product details are buttons. Reinspect the current DOM before relying on historical link-role selectors.
- `tests/order.spec.ts` now asserts **Checkout: Your Information** after starting Checkout and **Checkout: Overview** after Continue. These assertions were corrected and the test verified in Chromium after the original planning task.
- Use web-first assertions for URLs, stage titles, row contents, totals, alerts, and completion. Avoid fixed sleeps. For receipt generation, register the download wait before the click.
- No numerical name/postal length boundary, PDF content structure, keyboard-only flow, browser-back behavior, refresh behavior, backend order identifier, payment authorization, or durable order history was verified. These are follow-up investigations, not inferred capabilities.

## Exit criteria

The plan is ready for implementation when the P0/P1 scenarios have independent setup and explicit assertions, the observed empty-cart/input-validation gaps have product decisions, and receipt/persistence extensions have agreed expectations. Completion of this document does not mean that all planned scenarios were executed: only the interactions described as observed were explored through MCP.
