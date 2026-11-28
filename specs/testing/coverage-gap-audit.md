# Sauce Demo automated coverage audit and gap plans

Date: 27 November 2026. Reviewed revision: `a066e2d`. Application: https://www.saucedemo.com/.

## Method and limits

Read all specs under `tests/`, their fixtures, PageObjects, existing plans and [automation patterns](../engineering/Test-automation-patterns.md). `npx playwright test --list` discovered **37 Chromium tests across eight spec files**. This is assertion-based functional coverage analysis, not an instrumented code-coverage percentage. Tests with overlapping outcomes inflate the count; an implemented PageObject method or a button-visibility assertion does not cover that action's behavior.

Used the repository's `.github/.agents/skills/playwright-cli/SKILL.md` and test-generation planning reference to explore in a headed Chrome session named `coverage-audit`, through **Playwright CLI only**. No Playwright MCP or generated test scripts were used. Local Playwright 1.56.1 does not support the skill's newer `--debug=cli` attachment workflow, so direct global CLI browser commands reproduced login/setup instead. Public standard-user credentials and fictitious checkout data were used. This task did not rerun the automated suite: test discovery and live exploration are separate evidence.

## Existing automated assertions

| Spec under `tests/` | Tests | Asserted behavior / limits |
| --- | ---: | --- |
| `architecture.spec.ts` | 3 | Extra-context authentication isolation, same-context tab sharing, cookie/context lifecycle checks; unauthorized inventory access. No logout guard coverage. |
| `login.spec.ts` | 5 | Landing title and successful/invalid login, including utility/factory variants. |
| `loginParameterized.spec.ts` | 6 | Missing username/password, locked user, invalid and valid credential variants. No dismissal/recovery sequence. |
| `seed.spec.ts` | 1 | Login and Products starting state. |
| `order.spec.ts` | 1 | Complete Backpack order, payment/shipping, single-item totals, confirmation and empty badge. Home/PDF controls only checked for visibility. |
| `place-a-single-product-order.spec.ts` | 8 | Independent stages of Backpack happy path: add/cart/info/overview/totals/finish/confirmation. Substantial overlap with the order spec. |
| `product-details.spec.ts` | 1 | Backpack details, add, return to Products preserving selection, then cart identity/quantity/price. |
| `cancel-order/cancel-order.spec.ts` | 12 | Remove/re-add, empty-cart persistence, cancellation with blank/partial/complete data, First Name error then cancel, single/two-item overview cancellation, clear-after-cancel and remaining-item preservation. No two-item total/completion assertion. |
| **Total** | **37** | **Eight spec files; Chromium only in discovered configuration.** |

The earlier [order creation plan](order.md) contains 16 scenarios; its existence does not mean those scenarios are automated. Its multi-product completion, validation recovery, PDF, repeat ordering and populated-cart reload backlog overlaps the refined plans below. Implement each scenario once, using these newer observations to refine the corresponding ORD case. The [cancellation plan](cancel-order.md) already has substantial automation, so these additions do not repeat basic cancellation/removal cases.

## Gap plans by functional area

| Functional area | New plan | Main gap / priority |
| --- | --- | --- |
| Authentication/session | [Authentication and session](authentication-session-gaps.md) | Logout revocation (P0), error dismissal/recovery, same-account cart retention policy. |
| Standard catalog | [Sorting](catalog-sorting-gaps.md) | All sort modes, selected-item preservation and actions after reorder (P1). |
| Product details/cart | [Details and cart persistence](product-details-cart-gaps.md) | Remove from details while preserving another item; populated reload; entry-point consistency (P1/P2). |
| Navigation/reset | [Navigation and Reset App State](navigation-reset-gaps.md) | Immediate reset consistency discrepancy (P0), navigation/reload coherence. |
| Dynamic Catalog | [Dynamic Catalog](dynamic-catalog-gaps.md) | Lazy append, spinner completion, manual and automatic slider behavior (P1/P2). |
| Checkout validation | [Validation and recovery](checkout-validation-gaps.md) | Independent required fields and successful recovery preserving the cart (P0). |
| Completion/receipts | [Completion and PDF receipts](order-completion-receipts-gaps.md) | Two-item totals/completion (P0), actual download contents and repeat purchase (P1). |

## Exploration findings

- All four standard sort modes changed ordering without losing selected Backpack or changing product name/price associations.
- Removing Bike Light on its details page preserved Backpack. Reloading the populated cart retained Backpack, quantity 1 and `$29.99`.
- **Reset inconsistency:** Reset App State cleared the badge but left Backpack showing Remove on the current Products view. Navigating away and back restored Add to cart. Immediate post-reset cart rows were not inspected. Track the mismatch; proposed coherent-reset acceptance is not a passing baseline.
- Dynamic Catalog exposed three entirely untested routes: Lazy Load initially showed 12 cards and appended after scrolling; Spinner exposed Loading then six products; Slider changed products automatically. A manual-selection result could not be isolated from automatic rotation and remains an investigation.
- Missing Last Name and Postal Code blocked checkout; dismissing an error retained input, and correcting the fields led to overview and successful completion.
- Backpack plus Bike Light completed at subtotal `$39.98`, tax `$3.20`, total `$43.18`. The downloaded PDF had a valid header and extracted customer, items and totals. Back Home returned to empty-cart Products.
- Logout prevented returning to inventory via browser Back. Direct logged-out cart and information URLs were redirected to login. Relogging into the same account restored the existing cart; retention policy is not inferred for different accounts.

Named CLI snapshots under ignored `.playwright-cli/` include `coverage-reset.yml`, `coverage-reset-return.yml`, `coverage-lazy.yml`, `coverage-lazy-end.yml`, `coverage-spinner.yml`, `coverage-slider-selected.yml`, `coverage-details-removed.yml`, `coverage-populated-cart-reload.yml`, `coverage-missing-last-name.yml`, `coverage-missing-postal.yml`, `coverage-validation-dismissed.yml`, `coverage-multi-overview.yml`, `coverage-receipt-complete.yml`, `coverage-back-home.yml`, `coverage-logout-back.yml`, `coverage-guest-cart.yml`, `coverage-guest-checkout.yml`, `coverage-login-error-dismissed.yml` and `coverage-relogin.yml`. These local artifacts are supplementary; durable observations and expectations are recorded in the plans. The inspected download was `swag-labs-order-2026-11-27-23-34-38.pdf` (3,046 bytes); exact timestamp/size are not regression requirements.

## Boundaries and implementation order

Prioritize logout guards, required-field recovery, two-item completion and the reset discrepancy. Then cover sorting, details/cart persistence, download contents and Dynamic Catalog. Separate observed baselines from proposed acceptance/investigation cases; do not silently bless an observed defect or invent validation policy.

This exploration used standard_user in desktop Chrome. It does not establish behavior for other demo personas, other engines/devices, cross-account cart privacy, lazy-list exhaustion, loading-network failures, slider timing, PDF visual/accessibility quality, external link destinations after navigation, real payments or backend persistence. Existing ORD-14/15/16 remain separate policy/exploration backlog for empty-cart checkout, whitespace and malformed postal values. No claim of exhaustive website coverage is made.

At the original audit stage, only Markdown plans were added. Future generated tests must use the PageObject fixtures and independent setup/cleanup described in each plan; no specs, fixtures or PageObjects were modified by this audit.

## Automation follow-up — 28 November 2026

The seven plans now map all 22 scenario IDs to specs under `tests/coverage-gaps/`. Parameterization produces 35 new Chromium tests. New PageObjects and typed fixtures cover Dynamic Catalog pages and the shared menu; the engineering route map has been updated. Every new spec uses the root PageObject fixtures and beforeEach/afterEach setup/cleanup. Receipt assertions use a PDF text parser and preserve downloads as per-test report artifacts.

User decisions: same-account cart retention is an approved regression baseline; immediate reset button consistency stays an investigation. RESET-01 attaches the observed button state and screenshot, annotates a mismatch, and verifies cart clearing/re-addition without claiming that the unresolved immediate consistency requirement passes. No scenario is skipped or marked as an expected failure.

Generation refined Dynamic Catalog expectations using live CLI interaction and source inspection: lazy initial count depends on viewport intersection, slider cards have no description field, rotation is 2000ms, and the spinner delay is bounded below 3000ms. Direct route navigation in controlled-time tests avoids freezing menu animation timers. Menu navigation remains tested independently.

Validation: `npx playwright test --project=chromium --retries=0 --workers=4` completed with **72 passed in 32.5 seconds**: 35 new tests plus all 37 pre-existing tests. No tests were skipped, retried, or marked as expected failures. The initial generation failures were healed by scoping clock control after login and using direct page navigation for timed checks, and by replacing the obsolete PDF parser with Node-20-compatible `pdf-parse` 2.4.5. Static checks confirmed all 22 planned IDs have spec mappings, local links resolve, each PageObject file has one class, and new specs contain no PageObject construction, fixed sleeps or `networkidle` waits.
