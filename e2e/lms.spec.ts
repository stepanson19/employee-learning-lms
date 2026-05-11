import { expect, type Page, test } from "@playwright/test";

const routes = [
  { path: "/", title: "Дашборд обучения" },
  { path: "/courses", title: "Каталог курсов" },
  { path: "/courses/onboarding", title: "Быстрый старт сотрудника" },
  { path: "/profile", title: "Мой кабинет" },
  { path: "/achievements", title: "Достижения и геймификация" },
  { path: "/feedback", title: "Коммуникации и обратная связь" }
];

async function login(page: Page, email = "danil@learnhub.local", passcode = "employee2026") {
  await page.goto("/login");
  await page.getByLabel("почта").fill(email);
  await page.getByLabel("код доступа").fill(passcode);
  await page.getByRole("button", { name: "войти" }).click();
  await expect(page.getByText("Платформа удаленного обучения сотрудников")).toBeVisible();
}

test.describe("full lms app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "сбросить демо-данные" }).click();
  });

  test("requires sign in before opening the platform", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Требуется вход" })).toBeVisible();
    await expect(page.getByRole("link", { name: "открыть вход" })).toBeVisible();
  });

  for (const route of routes) {
    test(`opens ${route.path} after sign in`, async ({ page }) => {
      await login(page);
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.title })).toBeVisible();
      await expect(page.getByText("Данил Мятный · Продажи · сотрудник")).toBeVisible();
    });
  }

  test("restricts analytics for an employee and allows HR", async ({ page }) => {
    await login(page);
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Раздел доступен HR и автору" })).toBeVisible();

    await page.evaluate(() => window.localStorage.clear());
    await page.goto("/login");
    await page.getByLabel("почта").fill("hr@learnhub.local");
    await page.getByLabel("код доступа").fill("hr2026");
    await page.getByRole("button", { name: "войти" }).click();
    await page.goto("/analytics");

    await expect(page.getByRole("heading", { name: "Аналитика и отчетность" })).toBeVisible();
  });

  test("passes a quiz and persists updated progress", async ({ page }) => {
    await login(page);
    await page.goto("/courses/onboarding");
    await page.getByLabel("в библиотеке знаний платформы").check();
    await page.getByLabel("обновляется прогресс и начисляются XP").check();
    await page.getByRole("button", { name: "проверить тест" }).click();

    await expect(page.getByText("результат 100%")).toBeVisible();
    await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
  });

  test("lets an author add a quiz question", async ({ page }) => {
    await login(page, "author@learnhub.local", "author2026");
    await page.goto("/courses/sales");
    await page.getByLabel("вопрос").fill("Как фиксировать итог разговора?");
    await page.getByRole("textbox", { name: "вариант 1" }).fill("оставить заметку в CRM");
    await page.getByRole("textbox", { name: "вариант 2" }).fill("ничего не сохранять");
    await page.getByRole("textbox", { name: "пояснение" }).fill("итог должен быть доступен команде");
    await page.getByRole("button", { name: "добавить вопрос" }).click();

    await expect(page.getByText("Как фиксировать итог разговора?")).toBeVisible();
  });

  test("submits feedback from the signed-in user", async ({ page }) => {
    await login(page);
    await page.goto("/feedback");
    await page.getByRole("textbox").fill("после доработки форма сохраняет отзыв");
    await page.getByRole("button", { name: "отправить отзыв" }).click();

    await expect(page.getByText("после доработки форма сохраняет отзыв")).toBeVisible();
  });
});
