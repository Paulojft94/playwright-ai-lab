import { test, expect } from "../fixtures/pages";
import { usersData, createUser } from "../test-data/users";

test.describe("Login", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("landing page has title", async ({ loginPage }) => {
    await expect(loginPage.page).toHaveTitle("Swag Labs");
  });

  test("login with valid credentials", async ({ loginPage, inventoryPage }) => {
    await loginPage.login(usersData.username, usersData.password);

    await expect(inventoryPage.title).toHaveText("Products");
  });

  test("login with invalid credentials", async ({ loginPage }) => {
    await loginPage.login(usersData.invalidUsername, usersData.invalidPassword);

    await expect(loginPage.error).toHaveText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });
});

test.describe("Login with type utils", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("PARTIAL: login with invalid credentials", async ({
    loginPage,
  }) => {
    const invalidUser = createUser({ password: "wrongPassword" });

    await loginPage.login(invalidUser.username, invalidUser.password);

    await expect(loginPage.error).toHaveText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });

  test("Pick: login with valid credentials", async ({ loginPage, inventoryPage }) => {
    type PickedUser = Pick<typeof usersData, "username" | "password">;

    const validUser: PickedUser = {
      username: usersData.username,
      password: usersData.password,
    };

    await loginPage.login(validUser.username, validUser.password);

    await expect(inventoryPage.title).toHaveText("Products");
  });
});
