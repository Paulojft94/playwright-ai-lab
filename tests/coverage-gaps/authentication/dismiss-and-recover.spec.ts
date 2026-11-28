// spec: specs/testing/authentication-session-gaps.md
// seed: tests/seed.spec.ts (fresh context per test)
import { test, expect } from "../../../fixtures/pages";
import { registerHooks } from "../support";
registerHooks(false);

test("AUTH-01 — Dismiss and recover from a login error", async ({ loginPage, inventoryPage }) => {
  // 1. Reject invalid credentials.
  await loginPage.login("invalid_user", "invalid_password");
  await expect(loginPage.error).toContainText("Username and password do not match");
  await expect(loginPage.page).toHaveURL(/\/$/);
  // 2. Dismiss the error without discarding the fields.
  await loginPage.dismissError();
  await expect(loginPage.error).not.toBeVisible();
  await expect(loginPage.username).toHaveValue("invalid_user");
  await expect(loginPage.password).toHaveValue("invalid_password");
  await expect(loginPage.loginButton).toBeEnabled();
  // 3. Resubmission still validates.
  await loginPage.loginButton.click();
  await expect(loginPage.error).toContainText("Username and password do not match");
  // 4. Correct credentials recover successfully.
  await loginPage.login("standard_user", "secret_sauce");
  await expect(inventoryPage.page).toHaveURL(/\/inventory.html$/);
  await expect(inventoryPage.title).toHaveText("Products");
  await expect(loginPage.error).not.toBeVisible();
});
