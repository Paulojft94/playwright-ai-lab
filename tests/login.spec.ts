import { test, expect } from "@playwright/test";
import { usersData } from "../test-data/users";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });

  test("landing page has title", async ({ page }) => {
    await expect(page).toHaveTitle("Swag Labs");
  });

  test("login with valid credentials", async ({ page }) => {
    await page.getByTestId("username").fill(usersData.username);
    await page.getByTestId("password").fill(usersData.password);

    await page.getByTestId("login-button").click();

    await expect(page.getByText("Products")).toHaveText("Products");
  });

  test("login with invalid credentials", async ({ page }) => {
    await page.getByTestId("username").fill("invalid_user");
    await page.getByTestId("password").fill("invalid_password");
    await page.getByTestId("login-button").click();

    await expect(page.getByTestId("error")).toHaveText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });
});
