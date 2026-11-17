import { test, expect } from "../fixtures/login";

test.describe("login parameterized tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });
  [
    {
      username: "standard_user",
      password: "",
      expected: "Epic sadface: Password is required",
    },
    {
      username: "",
      password: "secret_sauce",
      expected: "Epic sadface: Username is required",
    },
    {
      username: "locked_out_user",
      password: "secret_sauce",
      expected: "Epic sadface: Sorry, this user has been locked out.",
    },
    {
      username: "paulo",
      password: "jft",
      expected:
        "Epic sadface: Username and password do not match any user in this service",
    },
  ].forEach(({ username, password, expected }) => {
    test(`testing with ${username} and ${password}`, async ({
      page,
      loginPage,
    }) => {
      await loginPage.login(username, password);

      await expect(page.getByTestId("error")).toHaveText(expected);
    });
  });
});
