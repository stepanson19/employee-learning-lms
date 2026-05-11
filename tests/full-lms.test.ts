import { describe, expect, it } from "vitest";
import { courses, demoAccounts, progressRecords, rewardItems, users } from "@/data/lms";
import { authenticateUser, canAccessRoute } from "@/lib/auth";
import {
  completeLesson,
  createInitialAppState,
  redeemReward,
  submitFeedback
} from "@/lib/state";

describe("full LMS auth and persistence logic", () => {
  it("authenticates demo users by email and passcode", () => {
    const session = authenticateUser(demoAccounts, "danil@learnhub.local", "employee2026");

    expect(session.ok).toBe(true);
    expect(session.ok ? session.session.userId : "").toBe("u-employee");
    expect(session.ok ? session.session.role : "").toBe("employee");
  });

  it("rejects invalid credentials without leaking account details", () => {
    const session = authenticateUser(demoAccounts, "danil@learnhub.local", "wrong");

    expect(session).toEqual({ ok: false, message: "неверная почта или код доступа" });
  });

  it("restricts HR analytics to HR and author roles", () => {
    expect(canAccessRoute("employee", "/analytics")).toBe(false);
    expect(canAccessRoute("hr", "/analytics")).toBe(true);
    expect(canAccessRoute("author", "/analytics")).toBe(true);
  });

  it("completes a lesson, closes a course and awards course XP once", () => {
    const state = createInitialAppState({ users, courses, progressRecords });
    const next = completeLesson(state, "u-employee", "c-onboarding", "l-on-4", "2026-05-11");
    const repeated = completeLesson(next, "u-employee", "c-onboarding", "l-on-4", "2026-05-11");

    const user = repeated.users.find((item) => item.id === "u-employee");
    const record = repeated.progressRecords.find((item) => item.userId === "u-employee" && item.courseId === "c-onboarding");

    expect(record).toMatchObject({ completedLessons: 4, totalLessons: 4, percent: 100, status: "completed" });
    expect(user?.xp).toBe(940);
    expect(user?.completedCourses).toBe(3);
    expect(user?.activeCourses).toBe(2);
    expect(courses.find((item) => item.id === "c-onboarding")?.lessons.find((lesson) => lesson.id === "l-on-4")?.completed).toBe(false);
  });

  it("stores feedback from the signed-in user", () => {
    const state = createInitialAppState({ users, courses, progressRecords });
    const next = submitFeedback(state, {
      courseId: "c-sales",
      userId: "u-employee",
      rating: 5,
      comment: "добавленные практические задания стали полезнее",
      createdAt: "2026-05-11"
    });

    expect(next.feedbackItems.at(-1)).toMatchObject({
      courseId: "c-sales",
      userId: "u-employee",
      rating: 5,
      comment: "добавленные практические задания стали полезнее"
    });
  });

  it("redeems rewards and keeps the original state immutable", () => {
    const state = createInitialAppState({ users, courses, progressRecords });
    const reward = rewardItems.find((item) => item.id === "company-merch");

    expect(reward).toBeDefined();

    const next = redeemReward(state, "u-employee", "company-merch", "2026-05-11");
    const user = next.users.find((item) => item.id === "u-employee");
    const originalUser = state.users.find((item) => item.id === "u-employee");

    expect(user?.xp).toBe((originalUser?.xp ?? 0) - (reward?.costXp ?? 0));
    expect(next.rewardRedemptions).toHaveLength(1);
    expect(state.rewardRedemptions).toHaveLength(0);
  });
});
