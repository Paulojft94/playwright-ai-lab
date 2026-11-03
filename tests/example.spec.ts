import { test, expect } from "@playwright/test";
import { usersData } from "../test-data/users";

test("landing page has title", async ({ page }) => {
  await page.goto("");
  await expect(page).toHaveTitle("Swag Labs");
});

test("login with valid credentials", async ({ page }) => {
  await page.goto("");

  await page.getByTestId("username").fill(usersData.username);
  await page.getByTestId("password").fill(usersData.password);

  await page.getByTestId("login-button").click();

  await expect(page.getByText("Products")).toHaveText("Products");
});
