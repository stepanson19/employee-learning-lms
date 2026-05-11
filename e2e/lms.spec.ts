import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", title: "Дашборд обучения" },
  { path: "/courses", title: "Каталог курсов" },
  { path: "/courses/onboarding", title: "Быстрый старт сотрудника" },
  { path: "/profile", title: "Мой кабинет" },
  { path: "/achievements", title: "Достижения и геймификация" },
  { path: "/analytics", title: "Аналитика и отчетность" },
  { path: "/feedback", title: "Коммуникации и обратная связь" }
];

test.describe("lms mvp navigation", () => {
  for (const route of routes) {
    test(`opens ${route.path}`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.title })).toBeVisible();
      await expect(page.getByText("Платформа удаленного обучения сотрудников")).toBeVisible();
    });
  }

  test("switches demo role in the application shell", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("видит личный план и прогресс")).toBeVisible();

    await page.getByRole("button", { name: "HR" }).click();
    await expect(page.getByText("контролирует обучение отдела")).toBeVisible();

    await page.getByRole("button", { name: "Автор" }).click();
    await expect(page.getByText("управляет курсами и тестами")).toBeVisible();
  });
});
