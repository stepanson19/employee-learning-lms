import { courses, courseAssignments, discussionMessages, feedbackItems, progressRecords, quizQuestions, users, xpTransactions } from "@/data/lms";
import type {
  AppState,
  Course,
  CourseAssignment,
  Difficulty,
  DiscussionMessage,
  Feedback,
  Lesson,
  LessonType,
  ProgressRecord,
  QuizAttempt,
  QuizQuestion,
  RewardRedemption
} from "@/types/lms";
import { rewardItems } from "@/data/lms";
import { gradeQuizAttempt } from "@/lib/quiz";

type StateSeed = Partial<AppState>;

type FeedbackInput = Omit<Feedback, "id">;

type DiscussionInput = Omit<DiscussionMessage, "id">;

type QuizQuestionInput = Omit<QuizQuestion, "id">;

type CourseDraftLesson = {
  title: string;
  type: LessonType;
  durationMinutes: number;
};

type CourseDraftInput = {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  authorId: string;
  deadline: string;
  xpReward: number;
  lessons: CourseDraftLesson[];
};

type CourseAssignmentInput = {
  userId: string;
  courseId: string;
  assignedById: string;
  dueDate: string;
  assignedAt: string;
};

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

function slugify(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("ru")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueSlug(coursesList: Course[], title: string): string {
  const baseSlug = slugify(title) || `course-${coursesList.length + 1}`;
  let slug = baseSlug;
  let index = 2;

  while (coursesList.some((course) => course.slug === slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
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
    quizAttempts: clone(seed.quizAttempts ?? []),
    courseAssignments: clone(seed.courseAssignments ?? courseAssignments),
    xpTransactions: clone(seed.xpTransactions ?? xpTransactions)
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
    progressRecords: updatedProgress,
    xpTransactions: shouldAwardXp
      ? [
          ...state.xpTransactions,
          {
            id: `xp-${state.xpTransactions.length + 1}-${Date.now()}`,
            userId,
            amount: updatedCourse.xpReward,
            sourceType: "course-completion",
            sourceId: courseId,
            description: `завершен курс «${updatedCourse.title}»`,
            createdAt: completedAt
          }
        ]
      : state.xpTransactions
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
    rewardRedemptions: [...state.rewardRedemptions, redemption],
    xpTransactions: [
      ...state.xpTransactions,
      {
        id: `xp-${state.xpTransactions.length + 1}-${Date.now()}`,
        userId,
        amount: -reward.costXp,
        sourceType: "reward-redemption",
        sourceId: rewardId,
        description: `заявка на поощрение «${reward.title}»`,
        createdAt
      }
    ]
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

export function createCourse(state: AppState, input: CourseDraftInput): AppState {
  const courseId = `c-custom-${state.courses.length + 1}-${Date.now()}`;
  const lessons: Lesson[] = input.lessons.map((lesson, index) => ({
    id: `${courseId}-lesson-${index + 1}`,
    title: lesson.title.trim(),
    type: lesson.type,
    durationMinutes: Math.max(1, Math.round(lesson.durationMinutes)),
    completed: false
  }));
  const course: Course = {
    id: courseId,
    slug: uniqueSlug(state.courses, input.title),
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim().toLocaleLowerCase("ru"),
    difficulty: input.difficulty,
    status: "draft",
    authorId: input.authorId,
    durationMinutes: lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    deadline: input.deadline,
    xpReward: Math.max(0, Math.round(input.xpReward)),
    lessons
  };

  return {
    ...state,
    courses: [...state.courses, course]
  };
}

export function assignCourse(state: AppState, input: CourseAssignmentInput): AppState {
  const user = state.users.find((item) => item.id === input.userId);
  const course = state.courses.find((item) => item.id === input.courseId);
  const hasAssignment = state.courseAssignments.some((item) => item.userId === input.userId && item.courseId === input.courseId);
  const existingRecord = state.progressRecords.find((item) => item.userId === input.userId && item.courseId === input.courseId);

  if (!user || !course || hasAssignment) {
    return state;
  }

  const assignment: CourseAssignment = {
    id: `ca-${state.courseAssignments.length + 1}-${Date.now()}`,
    userId: input.userId,
    courseId: input.courseId,
    assignedById: input.assignedById,
    dueDate: input.dueDate,
    assignedAt: input.assignedAt,
    status: "active"
  };
  const progressRecord: ProgressRecord = {
    userId: input.userId,
    courseId: input.courseId,
    completedLessons: 0,
    totalLessons: course.lessons.length,
    percent: 0,
    score: 0,
    timeSpentMinutes: 0,
    status: "active",
    updatedAt: input.assignedAt
  };
  const updatedUsers = state.users.map((item) =>
    item.id === input.userId && !existingRecord
      ? {
          ...item,
          activeCourses: item.activeCourses + 1,
          notifications: [`назначен курс «${course.title}» до ${input.dueDate}`, ...item.notifications]
        }
      : item
  );

  return {
    ...state,
    users: updatedUsers,
    courseAssignments: [...state.courseAssignments, assignment],
    progressRecords: existingRecord ? state.progressRecords : [...state.progressRecords, progressRecord]
  };
}
