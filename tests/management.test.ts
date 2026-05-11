import { describe, expect, it } from "vitest";
import { courses, progressRecords, quizQuestions, users } from "@/data/lms";
import type { AppState, Course, Difficulty, LessonType, ProgressRecord, User } from "@/types/lms";
import { createInitialAppState, redeemReward, submitQuizAttempt } from "@/lib/state";
import * as stateLib from "@/lib/state";
import * as lmsLib from "@/lib/lms";

type CourseDraftLesson = {
  title: string;
  type: LessonType;
  durationMinutes: number;
};

type CourseDraft = {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  authorId: string;
  deadline: string;
  xpReward: number;
  lessons: CourseDraftLesson[];
};

type CourseAssignmentDraft = {
  userId: string;
  courseId: string;
  assignedById: string;
  dueDate: string;
  assignedAt: string;
};

type ExtendedState = AppState & {
  courseAssignments: Array<{ userId: string; courseId: string; dueDate: string; status: string }>;
  xpTransactions: Array<{ userId: string; amount: number; sourceType: string; description: string }>;
};

type StateActions = typeof stateLib & {
  createCourse?: (state: AppState, input: CourseDraft) => AppState;
  assignCourse?: (state: AppState, input: CourseAssignmentDraft) => AppState;
};

type AnalyticsRow = {
  user: User;
  course: Course;
  record: ProgressRecord;
};

type AnalyticsActions = typeof lmsLib & {
  getAnalyticsRows?: (
    users: User[],
    courses: Course[],
    progress: ProgressRecord[],
    filters: { department?: string; courseId?: string }
  ) => AnalyticsRow[];
  exportAnalyticsCsv?: (rows: AnalyticsRow[]) => string;
};

const stateActions = stateLib as StateActions;
const analyticsActions = lmsLib as AnalyticsActions;

describe("course management and reporting", () => {
  it("creates a draft course with generated lessons and slug", () => {
    if (!stateActions.createCourse) {
      throw new Error("createCourse is not implemented");
    }

    const state = createInitialAppState({ users, courses, progressRecords });
    const next = stateActions.createCourse(state, {
      title: "Service Quality",
      description: "Практика контроля качества обслуживания клиентов.",
      category: "сервис",
      difficulty: "средний",
      authorId: "u-author",
      deadline: "2026-06-10",
      xpReward: 240,
      lessons: [
        { title: "стандарты сервиса", type: "longread", durationMinutes: 20 },
        { title: "практический тест", type: "test", durationMinutes: 15 }
      ]
    });
    const created = next.courses.at(-1);

    expect(created).toMatchObject({
      title: "Service Quality",
      slug: "service-quality",
      status: "draft",
      durationMinutes: 35,
      xpReward: 240
    });
    expect(created?.lessons).toEqual([
      expect.objectContaining({ title: "стандарты сервиса", completed: false }),
      expect.objectContaining({ title: "практический тест", completed: false })
    ]);
    expect(state.courses).toHaveLength(courses.length);
  });

  it("assigns a course to an employee and creates an empty progress record", () => {
    if (!stateActions.assignCourse) {
      throw new Error("assignCourse is not implemented");
    }

    const state = createInitialAppState({ users, courses, progressRecords });
    const next = stateActions.assignCourse(state, {
      userId: "u-support",
      courseId: "c-sales",
      assignedById: "u-hr",
      dueDate: "2026-06-01",
      assignedAt: "2026-05-11"
    }) as ExtendedState;
    const record = next.progressRecords.find((item) => item.userId === "u-support" && item.courseId === "c-sales");
    const user = next.users.find((item) => item.id === "u-support");

    expect(next.courseAssignments.at(-1)).toMatchObject({
      userId: "u-support",
      courseId: "c-sales",
      dueDate: "2026-06-01",
      status: "active"
    });
    expect(record).toMatchObject({ completedLessons: 0, totalLessons: 4, percent: 0, status: "active" });
    expect(user?.activeCourses).toBe(3);
    expect(user?.notifications[0]).toContain("назначен курс");
  });

  it("records XP transactions for course completion and reward redemption", () => {
    const state = createInitialAppState({ users, courses, progressRecords, quizQuestions });
    const completed = submitQuizAttempt(
      state,
      "u-employee",
      "c-onboarding",
      "l-on-4",
      {
        "q-on-1": "a-on-1",
        "q-on-2": "a-on-4"
      },
      "2026-05-11"
    ) as ExtendedState;
    const redeemed = redeemReward(completed, "u-employee", "company-merch", "2026-05-12") as ExtendedState;

    expect(completed.xpTransactions.at(-1)).toMatchObject({
      userId: "u-employee",
      amount: 180,
      sourceType: "course-completion"
    });
    expect(redeemed.xpTransactions.at(-1)).toMatchObject({
      userId: "u-employee",
      amount: -450,
      sourceType: "reward-redemption"
    });
  });

  it("filters analytics rows and exports them to csv", () => {
    if (!analyticsActions.getAnalyticsRows || !analyticsActions.exportAnalyticsCsv) {
      throw new Error("analytics report helpers are not implemented");
    }

    const rows = analyticsActions.getAnalyticsRows(users, courses, progressRecords, { department: "Продажи" });
    const csv = analyticsActions.exportAnalyticsCsv(rows);

    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.user.department === "Продажи")).toBe(true);
    expect(csv.split("\n")[0]).toBe("employee,department,course,progress,score,status");
    expect(csv).toContain("Данил Мятный,Продажи,Быстрый старт сотрудника,75,92,active");
  });
});
