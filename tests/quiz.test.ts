import { describe, expect, it } from "vitest";
import { courses, progressRecords, quizQuestions, users } from "@/data/lms";
import { createInitialAppState, submitQuizAttempt, addQuizQuestion } from "@/lib/state";
import { gradeQuizAttempt } from "@/lib/quiz";

describe("course quizzes", () => {
  it("grades quiz answers and marks passing attempts", () => {
    const result = gradeQuizAttempt(
      quizQuestions.filter((question) => question.courseId === "c-onboarding"),
      {
        "q-on-1": "a-on-1",
        "q-on-2": "a-on-4"
      }
    );

    expect(result).toEqual({
      correctAnswers: 2,
      totalQuestions: 2,
      score: 100,
      passed: true
    });
  });

  it("stores failed quiz attempts without completing the lesson", () => {
    const state = createInitialAppState({ users, courses, progressRecords, quizQuestions });
    const next = submitQuizAttempt(
      state,
      "u-employee",
      "c-onboarding",
      "l-on-4",
      {
        "q-on-1": "wrong",
        "q-on-2": "a-on-4"
      },
      "2026-05-11"
    );
    const record = next.progressRecords.find((item) => item.userId === "u-employee" && item.courseId === "c-onboarding");
    const testLesson = next.courses.find((item) => item.id === "c-onboarding")?.lessons.find((lesson) => lesson.id === "l-on-4");

    expect(next.quizAttempts).toHaveLength(1);
    expect(next.quizAttempts[0]).toMatchObject({ score: 50, passed: false });
    expect(record?.percent).toBe(75);
    expect(testLesson?.completed).toBe(false);
  });

  it("completes the test lesson and awards course XP once after a passing quiz", () => {
    const state = createInitialAppState({ users, courses, progressRecords, quizQuestions });
    const passed = submitQuizAttempt(
      state,
      "u-employee",
      "c-onboarding",
      "l-on-4",
      {
        "q-on-1": "a-on-1",
        "q-on-2": "a-on-4"
      },
      "2026-05-11"
    );
    const repeated = submitQuizAttempt(
      passed,
      "u-employee",
      "c-onboarding",
      "l-on-4",
      {
        "q-on-1": "a-on-1",
        "q-on-2": "a-on-4"
      },
      "2026-05-11"
    );
    const user = repeated.users.find((item) => item.id === "u-employee");
    const record = repeated.progressRecords.find((item) => item.userId === "u-employee" && item.courseId === "c-onboarding");

    expect(record).toMatchObject({ completedLessons: 4, percent: 100, status: "completed", score: 100 });
    expect(user?.xp).toBe(940);
    expect(repeated.quizAttempts).toHaveLength(2);
  });

  it("lets authors add a quiz question without mutating the original state", () => {
    const state = createInitialAppState({ users, courses, progressRecords, quizQuestions });
    const next = addQuizQuestion(state, {
      courseId: "c-sales",
      lessonId: "l-sa-4",
      prompt: "Какой первый шаг при работе с возражением?",
      options: [
        { id: "new-1", text: "уточнить причину сомнения" },
        { id: "new-2", text: "сразу дать скидку" }
      ],
      correctOptionId: "new-1",
      explanation: "сначала нужно понять контекст возражения"
    });

    expect(next.quizQuestions).toHaveLength(state.quizQuestions.length + 1);
    expect(state.quizQuestions).toHaveLength(quizQuestions.length);
    expect(next.quizQuestions.at(-1)?.courseId).toBe("c-sales");
  });
});
