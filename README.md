# Playwright AI Lab

This project is a space for learning and experimenting with Playwright. The current goal is to understand and demonstrate Playwright's architecture through practical tests, especially the relationship between browsers, browser contexts, and pages, as well as state isolation between contexts.

## Architecture explored

In Playwright, a **browser** represents the browser instance started by a test. A browser can contain multiple independent **browser contexts**. Each context behaves like an isolated session with its own state, such as cookies. A context can contain one or more **pages** (tabs). Pages in the same context share that context's state; pages in different contexts do not.

The active test in `tests/architecture.spec.ts` creates a second context with `browser.newContext()` and opens a page in that context. It adds different cookies to the two contexts and logs their cookies to observe the isolation. In the `finally` block, it closes the second context with `secondContext.close()` and checks that only one context remains in the browser.

The same file also contains exploratory examples marked with `test.skip`: one compares access to an authenticated page from different contexts; the other opens a second page in the existing context and observes the shared cookies. They are kept as reference and are not run while skipped.

## Other tests

`tests/login.spec.ts` covers the home page title and login flows with valid and invalid credentials. The test credentials are stored in `test-data/users.ts`.

The configuration in `playwright.config.ts` uses Chromium as the test browser, sets `https://www.saucedemo.com/` as the `baseURL`, and identifies test elements through the `data-test` attribute.

## Running the tests

```bash
npx playwright test
```

To run only the architecture tests:

```bash
npx playwright test tests/architecture.spec.ts
```
