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
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    const resetResponse = page.waitForResponse((response) => response.url().includes("/api/lms/state") && response.request().method() === "DELETE");
    await page.getByRole("button", { name: "сбросить демо-данные" }).click();
    await resetResponse;
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
    await expect(page.getByText("состояние обучения")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Зона внимания" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Эффективность курсов" })).toBeVisible();
  });

  test("filters analytics by department", async ({ page }) => {
    await login(page, "hr@learnhub.local", "hr2026");
    await page.goto("/analytics");
    await page.getByLabel("отдел").selectOption("Поддержка");

    await expect(page.getByRole("cell", { name: "Алена Сергеева" })).toBeVisible();
    await expect(page.getByText("1 сотрудников")).toBeVisible();
  });

  test("shows profile next step and roadmap", async ({ page }) => {
    await login(page);
    await page.goto("/profile");

    await expect(page.getByRole("heading", { name: "Следующий шаг" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Учебная дорожная карта" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Пульс обучения" })).toBeVisible();
    await expect(page.locator(".next-course-panel").getByText("Быстрый старт сотрудника")).toBeVisible();
  });

  test("shows role-aware dashboard actions", async ({ page }) => {
    await login(page);
    await expect(page.getByText("следующее действие")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Продолжить назначенное обучение" })).toBeVisible();
    await expect(page.getByText("план на неделю")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ближайшие шаги" })).toBeVisible();
    await expect(page.locator(".module-grid").getByText("Аналитика")).toHaveCount(0);
    await expect(page.locator(".module-grid").getByText("Система")).toHaveCount(0);

    await page.evaluate(() => window.localStorage.clear());
    await login(page, "hr@learnhub.local", "hr2026");
    await expect(page.getByRole("heading", { name: "Проверить прогресс команды" })).toBeVisible();
    await expect(page.locator(".module-grid").getByText("Аналитика")).toBeVisible();
    await expect(page.locator(".module-grid").getByText("Система")).toBeVisible();
  });

  test("shows course hero and learning roadmap state", async ({ page }) => {
    await login(page);
    await page.goto("/courses/onboarding");

    await expect(page.getByText("маршрут курса")).toBeVisible();
    await expect(page.getByText("следующий шаг: итоговый тест")).toBeVisible();
    await expect(page.getByRole("link", { name: "к урокам" })).toBeVisible();
    await expect(page.getByText("статус теста")).toBeVisible();
  });

  test("filters courses by search query", async ({ page }) => {
    await login(page);
    await page.goto("/courses");
    await page.getByLabel("поиск курса").fill("безопасность");

    await expect(page.getByRole("heading", { name: "Информационная безопасность" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Быстрый старт сотрудника" })).toHaveCount(0);
    await expect(page.locator(".course-result-count")).toContainText("1");
  });

  test("restricts system tools for an employee and allows HR", async ({ page }) => {
    await login(page);
    await page.goto("/system");
    await expect(page.getByRole("heading", { name: "Раздел доступен HR и автору" })).toBeVisible();

    await page.evaluate(() => window.localStorage.clear());
    await page.goto("/login");
    await page.getByLabel("почта").fill("hr@learnhub.local");
    await page.getByLabel("код доступа").fill("hr2026");
    await page.getByRole("button", { name: "войти" }).click();
    await page.goto("/system");

    await expect(page.getByRole("heading", { name: "Системное управление" })).toBeVisible();
    await expect(page.getByRole("link", { name: "скачать JSON" })).toBeVisible();
    await expect(page.getByText("JSON fallback").first()).toBeVisible();
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

  test("restores updated progress from the server state API", async ({ page }) => {
    await login(page);
    await page.goto("/courses/onboarding");
    await page.getByLabel("в библиотеке знаний платформы").check();
    await page.getByLabel("обновляется прогресс и начисляются XP").check();
    const saveResponse = page.waitForResponse((response) => response.url().includes("/api/lms/state") && response.request().method() === "PUT");
    await page.getByRole("button", { name: "проверить тест" }).click();
    await saveResponse;

    await page.evaluate(() => window.localStorage.clear());
    await login(page);
    await page.goto("/courses/onboarding");

    await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("результат 100%")).toBeVisible();
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

  test("lets an author create a draft course", async ({ page }) => {
    await login(page, "author@learnhub.local", "author2026");
    await page.goto("/courses");
    await page.getByLabel("название курса").fill("Service Quality");
    await page.getByLabel("описание курса").fill("Практика контроля качества обслуживания клиентов.");
    await page.getByLabel("категория курса").fill("сервис");
    await page.getByLabel("урок 1").fill("стандарты сервиса");
    await page.getByLabel("урок 2").fill("практический разбор");
    await page.getByRole("button", { name: "создать курс" }).click();

    await expect(page.getByRole("heading", { name: "Service Quality" })).toBeVisible();
    await expect(page.getByText("черновик").last()).toBeVisible();
  });

  test("lets HR assign a course to an employee", async ({ page }) => {
    await login(page, "hr@learnhub.local", "hr2026");
    await page.goto("/courses");
    await page.getByLabel("выбор сотрудника").selectOption("u-support");
    await page.getByLabel("выбор курса").selectOption("c-sales");
    await page.getByLabel("срок назначения").fill("2026-06-01");
    await page.getByRole("button", { name: "назначить курс" }).click();

    await expect(page.locator(".list-item").filter({ hasText: "Алена Сергеева" }).filter({ hasText: "Продажи без потери качества · до 2026-06-01" }).first()).toBeVisible();
  });

  test("submits feedback from the signed-in user", async ({ page }) => {
    await login(page);
    await page.goto("/feedback");
    await page.getByRole("textbox").fill("после доработки форма сохраняет отзыв");
    await page.getByRole("button", { name: "отправить отзыв" }).click();

    await expect(page.getByText("после доработки форма сохраняет отзыв")).toBeVisible();
  });
});
