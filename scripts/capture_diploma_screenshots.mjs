import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.LMS_BASE_URL ?? "http://localhost:3000";
const outputDir = path.resolve("docs/diploma/generated/screenshots");

const shots = [
  {
    file: "01_content_cms.png",
    path: "/courses",
    email: "author@learnhub.local",
    passcode: "author2026"
  },
  {
    file: "02_gamification.png",
    path: "/achievements",
    email: "danil@learnhub.local",
    passcode: "employee2026"
  },
  {
    file: "03_employee_profile.png",
    path: "/profile",
    email: "danil@learnhub.local",
    passcode: "employee2026"
  },
  {
    file: "04_analytics.png",
    path: "/analytics",
    email: "hr@learnhub.local",
    passcode: "hr2026"
  },
  {
    file: "05_feedback.png",
    path: "/feedback",
    email: "hr@learnhub.local",
    passcode: "hr2026"
  }
];

async function login(page, email, passcode) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("почта").fill(email);
  await page.getByLabel("код доступа").fill(passcode);
  await page.getByRole("button", { name: "войти" }).click();
  await page.waitForLoadState("networkidle");
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });

for (const shot of shots) {
  await page.evaluate(() => window.localStorage.clear()).catch(() => undefined);
  await login(page, shot.email, shot.passcode);
  await page.goto(`${baseUrl}${shot.path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, shot.file), fullPage: true });
  console.log(`saved ${shot.file}`);
}

await browser.close();
