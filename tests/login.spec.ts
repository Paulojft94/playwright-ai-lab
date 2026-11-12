import { test, expect } from "@playwright/test";
import { usersData, createUser } from "../test-data/users";

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

test.describe("Login with type utils", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });

  test("PARTIAL: login with invalid credentials", async ({ page }) => {
    const invalidUser = createUser({ password: "wrongPassword" });

    await page.getByTestId("username").fill(invalidUser.username);
    await page.getByTestId("password").fill(invalidUser.password);

    await page.getByTestId("login-button").click();

    await expect(page.getByTestId("error")).toHaveText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });

  test("Pick: login with valid credentials", async ({ page }) => {
    type PickedUser = Pick<typeof usersData, "username" | "password">;

    const validUser: PickedUser = {
      username: usersData.username,
      password: usersData.password,
    };

    await page.getByTestId("username").fill(validUser.username);
    await page.getByTestId("password").fill(validUser.password);

    await page.getByTestId("login-button").click();

    await expect(page.getByText("Products")).toHaveText("Products");
  });
});
