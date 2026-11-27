# Project engineering instructions

Follow the repository's [engineering rules](../AGENTS.md). Read [Test-automation-patterns.md](../specs/engineering/Test-automation-patterns.md) as the shared context for all Playwright planning, generation, implementation, refactoring, and healing.

New and refactored tests must use PageObjects rather than long raw page call chains, including within hooks and support helpers. PageObject classes belong under `page-object/`: one application page per class and one PageObject class per file. Reuse existing classes, keep scenario expectations explicit in tests, and validate affected specs after changes. This also applies when using the Planner, Generator, Healer, and Playwright CLI skill.

Create a typed, test-scoped fixture for each PageObject under the root `fixtures/` directory, composing them through `fixtures/pages.ts`. Tests and hooks must request these fixtures; constructing PageObjects in specs or helpers is prohibited. Existing test migration is deferred until explicitly requested.
