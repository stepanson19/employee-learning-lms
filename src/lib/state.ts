import { courses, discussionMessages, feedbackItems, progressRecords, quizQuestions, users } from "@/data/lms";
import type {
  AppState,
  Course,
  DiscussionMessage,
  Feedback,
  ProgressRecord,
  QuizAttempt,
  QuizQuestion,
  RewardRedemption,
  User
} from "@/types/lms";
import { rewardItems } from "@/data/lms";
import { gradeQuizAttempt } from "@/lib/quiz";

type StateSeed = Partial<AppState>;

type FeedbackInput = Omit<Feedback, "id">;

type DiscussionInput = Omit<DiscussionMessage, "id">;

type QuizQuestionInput = Omit<QuizQuestion, "id">;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildProgressRecord(userId: string, course: Course, completedLessons: number, createdAt: string): ProgressRecord {
  const totalLessons = course.lessons.length;
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return {
    userId,
    courseId: course.id,
    completedLessons,
    totalLessons,
    percent,
    score: percent === 100 ? 95 : Math.max(70, Math.round(70 + percent / 4)),
    timeSpentMinutes: course.lessons.slice(0, completedLessons).reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    status: percent === 100 ? "completed" : "active",
    updatedAt: createdAt
  };
}

export function createInitialAppState(seed: StateSeed = {}): AppState {
  return {
    users: clone(seed.users ?? users),
    courses: clone(seed.courses ?? courses),
    progressRecords: clone(seed.progressRecords ?? progressRecords),
    discussionMessages: clone(seed.discussionMessages ?? discussionMessages),
    feedbackItems: clone(seed.feedbackItems ?? feedbackItems),
    rewardRedemptions: clone(seed.rewardRedemptions ?? []),
    quizQuestions: clone(seed.quizQuestions ?? quizQuestions),
    quizAttempts: clone(seed.quizAttempts ?? [])
  };
}

export function completeLesson(state: AppState, userId: string, courseId: string, lessonId: string, completedAt: string): AppState {
  const course = state.courses.find((item) => item.id === courseId);

  if (!course) {
    return state;
  }

  const existingRecord = state.progressRecords.find((item) => item.userId === userId && item.courseId === courseId);
  const wasCompleted = existingRecord?.status === "completed" || existingRecord?.percent === 100;
  const lessonAlreadyCompleted = course.lessons.find((item) => item.id === lessonId)?.completed ?? false;
  const updatedCourses = state.courses.map((item) =>
    item.id === courseId
      ? {
          ...item,
          lessons: item.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, completed: true } : lesson))
        }
      : item
  );
  const updatedCourse = updatedCourses.find((item) => item.id === courseId) ?? course;
  const completedLessons = updatedCourse.lessons.filter((lesson) => lesson.completed).length;
  const nextRecord = buildProgressRecord(userId, updatedCourse, completedLessons, completedAt);
  const reachedCompletion = !wasCompleted && nextRecord.percent === 100;
  const shouldAwardXp = reachedCompletion && !lessonAlreadyCompleted;

  const updatedProgress = existingRecord
    ? state.progressRecords.map((record) => (record.userId === userId && record.courseId === courseId ? nextRecord : record))
    : [...state.progressRecords, nextRecord];

  const updatedUsers = state.users.map((user) => {
    if (user.id !== userId || !shouldAwardXp) {
      return user;
    }

    return {
      ...user,
      xp: user.xp + updatedCourse.xpReward,
      weeklyXp: user.weeklyXp + updatedCourse.xpReward,
      completedCourses: user.completedCourses + 1,
      activeCourses: Math.max(0, user.activeCourses - 1),
      notifications: [`курс «${updatedCourse.title}» завершен, начислено ${updatedCourse.xpReward} XP`, ...user.notifications]
    };
  });

  return {
    ...state,
    users: updatedUsers,
    courses: updatedCourses,
    progressRecords: updatedProgress
  };
}

export function submitFeedback(state: AppState, input: FeedbackInput): AppState {
  const nextFeedback: Feedback = {
    ...input,
    id: `f-${state.feedbackItems.length + 1}-${Date.now()}`
  };

  return {
    ...state,
    feedbackItems: [...state.feedbackItems, nextFeedback]
  };
}

export function addDiscussionMessage(state: AppState, input: DiscussionInput): AppState {
  const nextMessage: DiscussionMessage = {
    ...input,
    id: `d-${state.discussionMessages.length + 1}-${Date.now()}`
  };

  return {
    ...state,
    discussionMessages: [nextMessage, ...state.discussionMessages]
  };
}

export function redeemReward(state: AppState, userId: string, rewardId: string, createdAt: string): AppState {
  const reward = rewardItems.find((item) => item.id === rewardId);
  const user = state.users.find((item) => item.id === userId);

  if (!reward || !user || user.xp < reward.costXp || !reward.availableFor.includes(user.role)) {
    return state;
  }

  const redemption: RewardRedemption = {
    id: `rr-${state.rewardRedemptions.length + 1}-${Date.now()}`,
    userId,
    rewardId,
    costXp: reward.costXp,
    createdAt,
    status: "requested"
  };

  return {
    ...state,
    users: state.users.map((item) => (item.id === userId ? { ...item, xp: item.xp - reward.costXp } : item)),
    rewardRedemptions: [...state.rewardRedemptions, redemption]
  };
}

export function submitQuizAttempt(
  state: AppState,
  userId: string,
  courseId: string,
  lessonId: string,
  answers: Record<string, string>,
  createdAt: string
): AppState {
  const questions = state.quizQuestions.filter((question) => question.courseId === courseId && question.lessonId === lessonId);
  const result = gradeQuizAttempt(questions, answers);
  const attempt: QuizAttempt = {
    id: `qa-${state.quizAttempts.length + 1}-${Date.now()}`,
    userId,
    courseId,
    lessonId,
    answers,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
    score: result.score,
    passed: result.passed,
    createdAt
  };

  const withAttempt = {
    ...state,
    quizAttempts: [...state.quizAttempts, attempt]
  };

  if (!result.passed) {
    return withAttempt;
  }

  const completed = completeLesson(withAttempt, userId, courseId, lessonId, createdAt);

  return {
    ...completed,
    progressRecords: completed.progressRecords.map((record) =>
      record.userId === userId && record.courseId === courseId ? { ...record, score: result.score } : record
    )
  };
}

export function addQuizQuestion(state: AppState, input: QuizQuestionInput): AppState {
  const nextQuestion: QuizQuestion = {
    ...input,
    id: `q-${input.courseId}-${state.quizQuestions.length + 1}-${Date.now()}`
  };

  return {
    ...state,
    quizQuestions: [...state.quizQuestions, nextQuestion]
  };
}
