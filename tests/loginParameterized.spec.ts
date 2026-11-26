import { test, expect } from "../fixtures/login";
import { defaultUsers } from "../test-data/users";

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
    test(
      `testing with ${username} and ${password}`,
      {
        tag: "@regression",
      },
      async ({ page, loginPage }) => {
        await loginPage.login(username, password);

        await expect(page.getByTestId("error")).toHaveText(expected);
      },
    );
  });
});

test.describe("login parameterized tests with iterator and factory", () => {
  for (const { username, password, expected } of Object.values(defaultUsers)) {
    test(`testing with ${username} and ${password}`, async ({
      page,
      loginPage,
    }) => {
      await page.goto("");
      await loginPage.login(username, password);

      if (expected) {
        await expect(page.getByTestId("error")).toHaveText(expected);
      } else {
        await expect(page.getByText("Products")).toHaveText("Products");
      }
    });
  }
});
