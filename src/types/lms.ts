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
