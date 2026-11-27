import { test, expect } from "../fixtures/login";
import { usersData } from "../test-data/users";

test.describe("Test group", () => {
  test("seed", { tag: "@seed" }, async ({ page, loginPage }) => {
    await page.goto("");
    await loginPage.login(usersData.username, usersData.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByTestId("title")).toHaveText("Products");
  });
});
