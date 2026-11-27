import { test, expect } from "../fixtures/pages";
import { usersData } from "../test-data/users";

test.describe("Test group", () => {
  test("seed", { tag: "@seed" }, async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(usersData.username, usersData.password);

    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText("Products");
  });
});
