import { test, expect } from "@playwright/test";
import { usersData } from "../test-data/users";
import { LoginPage } from "../page-object/loginPage";

test.describe("playing with playwright architecture", () => {
  test("opening two different BROWSER contexts", async ({ page, browser }) => {
    await page.goto("");

    const loginPage = new LoginPage(page);
    await loginPage.login(usersData.username, usersData.password);

    //opening second context
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();

    await secondPage.goto("inventory.html");

    await expect(page.getByText("Products")).toHaveText("Products");

    await expect(await secondPage.getByTestId("error")).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });

  test("opening two different PAGE contexts", async ({ page }) => {
    await page.goto("");

    const loginPage = new LoginPage(page);
    await loginPage.login(usersData.username, usersData.password);

    await expect(page.getByText("Products")).toHaveText("Products");

    let secondPage;

    try {
      secondPage = await page.context().newPage();

      await secondPage.goto("inventory.html");

      await expect(page.getByText("Products")).toHaveText("Products");

      console.log(await secondPage.context().cookies());

      await page.context().addCookies([
        {
          name: "name",
          value: "Paulo jft",
          domain: "www.saucedemo.com",
          path: "/",
        },
      ]);
      console.log(await secondPage.context().cookies());
    } finally {
      await secondPage?.close();
    }
  });

  test("opening two browser contexts and two pages", async ({
    page,
    browser,
  }) => {
    await page.goto("");

    const secondContext = await browser.newContext();
    const secondPageContext = await secondContext.newPage();

    await secondPageContext.goto("");

    await page.context().addCookies([
      {
        name: "name",
        value: "Primeiro contexto PauloJFT",
        domain: "www.saucedemo.com",
        path: "/",
      },
    ]);

    await secondPageContext.context().addCookies([
      {
        name: "name",
        value: "Segundo contexto PauloJFT",
        domain: "www.saucedemo.com",
        path: "/",
      },
    ]);

    try {
      console.log(
        "Cookies do primeiro contexto:",
        await page.context().cookies(),
      );
      console.log(
        "Cookies do segundo contexto:",
        await secondPageContext.context().cookies(),
      );
    } finally {
      await secondContext.close();
    }
    expect(browser.contexts()).toHaveLength(1);
  });
});
