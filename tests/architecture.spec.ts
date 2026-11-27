import { test, expect } from "../fixtures/pages";
import { usersData } from "../test-data/users";

test.describe("playing with playwright architecture", () => {
  test("opening two different BROWSER contexts", async ({
    loginPage, inventoryPage, isolatedInventoryPage, isolatedLoginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.username, usersData.password);
    await expect(inventoryPage.title).toHaveText("Products");

    // The isolated context has a baseURL but no authentication from the first.
    await isolatedInventoryPage.goto();
    await expect(isolatedLoginPage.error).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
    await expect(inventoryPage.title).toHaveText("Products");
  });

  test("opening two different PAGE contexts", async ({
    loginPage, inventoryPage, sharedInventoryPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(usersData.username, usersData.password);
    await expect(inventoryPage.title).toHaveText("Products");

    await sharedInventoryPage.goto();
    await expect(sharedInventoryPage.title).toHaveText("Products");
    expect(sharedInventoryPage.page.context()).toBe(inventoryPage.page.context());
    await inventoryPage.page.context().addCookies([{
      name: "name", value: "Paulo jft", domain: "www.saucedemo.com", path: "/",
    }]);
    expect(await sharedInventoryPage.page.context().cookies()).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "name", value: "Paulo jft" })]),
    );
  });

  test("opening two browser contexts and two pages", async ({
    loginPage, isolatedLoginPage, isolatedContext, browser,
  }) => {
    await loginPage.goto();
    await isolatedLoginPage.goto();
    await loginPage.page.context().addCookies([{
      name: "name", value: "Primeiro contexto PauloJFT",
      domain: "www.saucedemo.com", path: "/",
    }]);
    await isolatedContext.addCookies([{
      name: "name", value: "Segundo contexto PauloJFT",
      domain: "www.saucedemo.com", path: "/",
    }]);

    expect(await loginPage.page.context().cookies()).toEqual(
      expect.arrayContaining([expect.objectContaining({
        name: "name", value: "Primeiro contexto PauloJFT",
      })]),
    );
    expect(await isolatedContext.cookies()).toEqual(
      expect.arrayContaining([expect.objectContaining({
        name: "name", value: "Segundo contexto PauloJFT",
      })]),
    );

    await isolatedContext.close();
    expect(browser.contexts()).toHaveLength(1);
  });
});
