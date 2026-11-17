import { test, expect } from "../fixtures/login";
import { usersData, createUser } from "../test-data/users";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });

  test("landing page has title", async ({ page }) => {
    await expect(page).toHaveTitle("Swag Labs");
  });

  test("login with valid credentials", async ({ page, loginPage }) => {
    await loginPage.login(usersData.username, usersData.password);

    await expect(page.getByText("Products")).toHaveText("Products");
  });

  test("login with invalid credentials", async ({ page, loginPage }) => {
    await loginPage.login(usersData.invalidUsername, usersData.invalidPassword);

    await expect(page.getByTestId("error")).toHaveText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });
});

test.describe("Login with type utils", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });

  test("PARTIAL: login with invalid credentials", async ({
    page,
    loginPage,
  }) => {
    const invalidUser = createUser({ password: "wrongPassword" });

    await loginPage.login(invalidUser.username, invalidUser.password);

    await expect(page.getByTestId("error")).toHaveText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });

  test("Pick: login with valid credentials", async ({ page, loginPage }) => {
    type PickedUser = Pick<typeof usersData, "username" | "password">;

    const validUser: PickedUser = {
      username: usersData.username,
      password: usersData.password,
    };

    await loginPage.login(validUser.username, validUser.password);

    await expect(page.getByText("Products")).toHaveText("Products");
  });
});
