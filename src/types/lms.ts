export type Role = "employee" | "hr" | "author";

export type CourseStatus = "draft" | "review" | "published" | "archived";

export type LessonType = "video" | "pdf" | "longread" | "test";

export type Difficulty = "базовый" | "средний" | "продвинутый";

export type ProgressStatus = "active" | "completed" | "overdue";

export interface User {
  id: string;
  name: string;
  role: Role;
  department: string;
  position: string;
  avatarInitials: string;
  xp: number;
  weeklyXp: number;
  completedCourses: number;
  activeCourses: number;
  skills: string[];
  notifications: string[];
}

export interface DemoAccount {
  userId: string;
  email: string;
  passcode: string;
  label: string;
}

export interface Session {
  userId: string;
  name: string;
  role: Role;
  email: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  completed: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  status: CourseStatus;
  authorId: string;
  durationMinutes: number;
  deadline: string;
  xpReward: number;
  lessons: Lesson[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: "blue" | "green" | "orange" | "violet" | "red";
  rule: "first-completion" | "high-score" | "level-specialist" | "three-completions" | "weekly-200" | "all-onboarding" | "author" | "hr-mentor";
}

export interface ProgressRecord {
  userId: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  score: number;
  timeSpentMinutes: number;
  status: ProgressStatus;
  updatedAt: string;
}

export interface DiscussionMessage {
  id: string;
  courseId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  courseId: string;
  lessonId: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  answers: Record<string, string>;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  passed: boolean;
  createdAt: string;
}

export interface QuizResult {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  passed: boolean;
}

export type AssignmentStatus = "active" | "completed" | "overdue";

export interface CourseAssignment {
  id: string;
  userId: string;
  courseId: string;
  assignedById: string;
  dueDate: string;
  assignedAt: string;
  status: AssignmentStatus;
}

export type XpSourceType = "course-completion" | "reward-redemption" | "manual-adjustment";

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  sourceType: XpSourceType;
  sourceId: string;
  description: string;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  costXp: number;
  availableFor: Role[];
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  costXp: number;
  createdAt: string;
  status: "requested" | "approved";
}

export interface AppState {
  users: User[];
  courses: Course[];
  progressRecords: ProgressRecord[];
  discussionMessages: DiscussionMessage[];
  feedbackItems: Feedback[];
  rewardRedemptions: RewardRedemption[];
  quizQuestions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  courseAssignments: CourseAssignment[];
  xpTransactions: XpTransaction[];
}

export interface LevelInfo {
  label: string;
  minXp: number;
  nextLabel: string | null;
  nextXp: number | null;
  progressToNext: number;
}

export interface AnalyticsSummary {
  completionRate: number;
  averageScore: number;
  activeLearners: number;
  totalTimeHours: number;
  engagementRate: number;
}

export interface CourseFilters {
  category?: string;
  status?: CourseStatus;
  difficulty?: Difficulty;
  query?: string;
}

export interface AnalyticsFilters {
  department?: string;
  courseId?: string;
}

export interface AnalyticsRow {
  user: User;
  course: Course;
  record: ProgressRecord;
}
