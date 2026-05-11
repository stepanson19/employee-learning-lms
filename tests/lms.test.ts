import { describe, expect, it } from "vitest";
import { badges, courses, progressRecords, users } from "@/data/lms";
import {
  filterCourses,
  getAnalyticsSummary,
  getCourseProgress,
  getEarnedBadges,
  getLeaderboard,
  getLevelByXp
} from "@/lib/lms";

describe("lms domain logic", () => {
  it("calculates the employee level from xp", () => {
    expect(getLevelByXp(760).label).toBe("специалист");
    expect(getLevelByXp(760).nextLabel).toBe("наставник");
  });

  it("calculates course progress from completed lessons", () => {
    const course = courses.find((item) => item.slug === "onboarding");

    expect(course).toBeDefined();
    expect(getCourseProgress(course?.lessons ?? [])).toBe(75);
  });

  it("returns earned badges for the selected employee", () => {
    const user = users.find((item) => item.id === "u-employee");

    expect(user).toBeDefined();
    expect(getEarnedBadges(user!, progressRecords, badges).map((badge) => badge.id)).toContain("fast-start");
    expect(getEarnedBadges(user!, progressRecords, badges).map((badge) => badge.id)).toContain("level-up");
  });

  it("sorts the leaderboard by xp descending", () => {
    const leaderboard = getLeaderboard(users);

    expect(leaderboard[0].xp).toBeGreaterThanOrEqual(leaderboard[1].xp);
    expect(leaderboard.at(-1)?.xp).toBeLessThanOrEqual(leaderboard[0].xp);
  });

  it("aggregates analytics summary from progress records", () => {
    const summary = getAnalyticsSummary(users, courses, progressRecords);

    expect(summary.completionRate).toBeGreaterThan(0);
    expect(summary.averageScore).toBeGreaterThan(70);
    expect(summary.activeLearners).toBe(4);
  });

  it("filters courses by category and status", () => {
    const filtered = filterCourses(courses, {
      category: "адаптация",
      status: "published"
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].slug).toBe("onboarding");
  });
});
