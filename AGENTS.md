# Engineering rules

## Test automation

Read and follow [Test-automation-patterns.md](specs/engineering/Test-automation-patterns.md) before planning, generating, implementing, refactoring, reviewing, or healing Playwright tests. It is the project-wide context file for test automation patterns.

New and refactored Playwright tests must use PageObjects. Keep page-specific selectors and actions under `page-object/`, with a separate PageObject class per application page and only one PageObject class per file. Follow the linked patterns and [Playwright's POM guidance](https://playwright.dev/docs/pom).

These rules apply equally to MCP agents, Playwright CLI skills, manual edits, fixtures, and support helpers. Exploration commands may drive the browser directly; persisted tests must use the PageObject APIs. Preserve explicit scenario assertions and independent setup/cleanup, and run affected tests before reporting completion.
